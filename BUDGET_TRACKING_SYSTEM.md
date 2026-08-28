# Budget Tracking System Documentation

## Overview

The budget tracking system ensures accurate pricing throughout the quotation builder journey, preventing budget duplication and maintaining service selections when navigating backward through the flow.

## Key Principles

### 1. Single Source of Truth
- **Event Services Memory**: Stores all selected services and their prices
- **No Duplication**: Each event is stored once with complete data
- **Functional Updates**: Uses previous state to prevent race conditions

### 2. Budget Tracking Strategy

#### Previous Approach (Problem)
```javascript
// OLD - Only counted finalized events
const calculateCumulativeTotal = () => {
  let total = 0
  finalizedEvents.forEach(eventType => {
    if (eventServicesMemory[eventType]) {
      total += eventServicesMemory[eventType].totalPrice || 0
    }
  })
  return total
}
```
**Issues:**
- Budget was lost when navigating back before finalization
- Services could be counted twice
- Inconsistent state between memory and displayed total

#### Current Approach (Solution)
```javascript
// NEW - Counts all events in memory, not just finalized
const calculateCumulativeTotal = () => {
  let total = 0
  Object.keys(eventServicesMemory).forEach(eventType => {
    if (eventServicesMemory[eventType]) {
      // Only add once per event to prevent duplication
      total += eventServicesMemory[eventType].totalPrice || 0
    }
  })
  return total
}
```
**Benefits:**
- Budget persists across navigation
- No double-counting
- Single source of truth

## Data Structure

### Event Services Memory
```javascript
eventServicesMemory = {
  'wedding': {
    services: ['traditional-photo', 'candid-video', 'drone'],
    totalPrice: 37000
  },
  'pre-wedding': {
    services: ['candid-photo', 'candid-video'],
    totalPrice: 28000
  },
  'engagement': {
    services: ['traditional-photo', 'traditional-video'],
    totalPrice: 23000
  },
  // ... more events
  'album': {
    services: ['one-month'],
    totalPrice: 40000
  }
}
```

### Key Points
- **Services Array**: List of selected service IDs
- **totalPrice**: Pre-calculated total for that event (no recalculation needed)
- **One Entry Per Event**: Each event type appears exactly once

## Service Handler Pattern

All service handlers follow the same safe pattern using functional state updates:

```javascript
const handleServiceNext = (services, totalPrice) => {
  // Use functional update to avoid stale closure
  setEventServicesMemory(prev => ({
    ...prev,
    [eventType]: { services, totalPrice }
  }))
  handleNavigateToNext(nextPageId)
}
```

### Why Functional Updates?
1. **Prevents Race Conditions**: Ensures you're working with current state
2. **Atomic Updates**: Single event is updated without affecting others
3. **Batching Safe**: React can batch multiple updates efficiently
4. **Predictable**: No dependency on state closure

## Budget Persistence on Navigation

### Forward Navigation → Back Navigation → Forward Again

```
Step 1.2 (Wedding Services)
  ↓ Select: Traditional Photo + Candid Video (₹21,000)
  ↓ Save to memory: wedding: {services: [...], totalPrice: 21000}
  ↓
Step 2.1 (Pre-wedding Confirmation) → Say NO
  ↓
Step 3.1 (Engagement Confirmation) → Say YES
  ↓
Step 3.2 (Engagement Services)
  ↓ Total displayed: ₹21,000 (from wedding, persisted in memory)
  ↓ Select services for engagement (e.g., ₹23,000)
  ↓ Save to memory: engagement: {services: [...], totalPrice: 23000}
  ↓
Step 14.3 (Album Delivery)
  ↓ Total budget = 21,000 + 23,000 + ... = ₹XXX,000
  ↓
Back to Step 3.2
  ↓ Engagement services still remembered from before
  ↓ Total still shows ₹21,000 + ₹23,000 = ₹44,000
  ↓
Back to Step 3.1 → Back to Step 2.1 → Back to Step 1.2
  ↓ Wedding services still remembered: ₹21,000
```

## Price Calculation Details

### Service Prices (Fixed)
```javascript
{
  'traditional-photo': 5000,
  'traditional-video': 5000,
  'candid-photo': 8000,
  'candid-video': 10000,
  'drone': 8000,
  'audience-video': 5000,
  'one-month': 40000,        // Album
  'three-months': 30000      // Album
}
```

### Event Total Price
Calculated when services are selected:
```javascript
totalPrice = sum of all selected service prices for that event
```

### Cumulative/Total Budget
```javascript
totalBudget = sum of all event totalPrices in eventServicesMemory
```

## Special Cases

### Pre-Wedding & Post-Wedding Services
These have duration-based pricing that replaces service pricing:

```javascript
// Pre-Wedding Duration Options
- 3-hours: ₹20,000
- 6-hours: ₹30,000
- Full-day: ₹45,000

// Post-Wedding Duration Options
- 1-day: ₹25,000
- 2-days: ₹40,000
- 3-days: ₹55,000
```

When duration is selected, the `totalPrice` stored in memory is the duration price (not service prices).

### Album Options
Album has two delivery time options with fixed prices:
```javascript
- one-month: ₹40,000
- three-months: ₹30,000
```

## Prevention of Budget Duplication

### Mechanism 1: Single Event Entry
Each event type appears only once in `eventServicesMemory`:
```javascript
// ✓ CORRECT - One entry
eventServicesMemory = {
  'wedding': { services: [...], totalPrice: 21000 },
  // other events...
}

// ✗ WRONG - Duplicate entries
eventServicesMemory = {
  'wedding': { services: [...], totalPrice: 21000 },
  'wedding-2': { services: [...], totalPrice: 21000 }, // DON'T DO THIS
}
```

### Mechanism 2: No Accumulation in Total Calculation
The calculation doesn't add same event multiple times:
```javascript
// ✓ CORRECT - Each event added once
Object.keys(eventServicesMemory).forEach(eventType => {
  total += eventServicesMemory[eventType].totalPrice
})

// ✗ WRONG - Could count same event twice if not careful
eventServicesMemory.forEach(...) // What if iterated twice?
```

### Mechanism 3: Overwrite on Re-selection
When user edits services for an event, old data is replaced:
```javascript
// First time selecting wedding services
eventServicesMemory['wedding'] = { services: ['photo'], totalPrice: 9000 }

// Go back and change selection
eventServicesMemory['wedding'] = { services: ['photo', 'video'], totalPrice: 23000 }
// Old data (9000) is completely replaced - not added
```

## Testing Scenarios

### Scenario 1: Linear Forward Navigation
1. Select all events sequentially
2. Each event's budget is added to total
3. Final total should be sum of all selected events

### Scenario 2: Branching with NO Responses
1. Select Wedding (₹21,000)
2. Say NO to Pre-Wedding
3. Say YES to Engagement (₹23,000)
4. Skip Groom (don't select)
5. Total should be: ₹21,000 + ₹23,000 = ₹44,000 (NOT ₹44,000)

### Scenario 3: Back Navigation Budget Persistence
1. Complete steps 1-5 with budgets
2. Go back to step 3
3. Modify engagement services
4. Go back to step 1
5. Check that wedding budget hasn't changed
6. Continue forward
7. Total budget should match previous calculation

### Scenario 4: Multiple Back/Forward Cycles
1. Step forward 1-5
2. Go back to step 3
3. Go forward to step 5
4. Go back to step 2
5. Go forward to step 5
6. Budget should remain consistent throughout

## State Update Pattern

### Avoid This Pattern (Race Condition Risk)
```javascript
const handler = (data) => {
  const newMemory = eventServicesMemory // Stale closure!
  newMemory['event'] = data
  setEventServicesMemory(newMemory) // Mutation!
}
```

### Use This Pattern (Safe)
```javascript
const handler = (data) => {
  setEventServicesMemory(prev => ({
    ...prev,
    ['event']: data
  }))
}
```

## Quote Summary Construction

The quote summary builds from ALL events in memory:
```javascript
const quoteEvents = Object.keys(eventServicesMemory).map(eventType => ({
  eventType,
  services: eventServicesMemory[eventType]?.services || [],
  totalPrice: eventServicesMemory[eventType]?.totalPrice || 0
}))
```

This ensures:
1. No budget loss
2. All selected events are displayed
3. Each event appears once
4. Total matches user's selections

## Debugging

### Check Memory State
Add console log to verify memory structure:
```javascript
console.log('Event Services Memory:', eventServicesMemory)
// Should show: { wedding: {...}, engagement: {...}, ... }
// Each event should appear ONCE
```

### Verify Total Calculation
```javascript
console.log('Calculated Total:', calculateCumulativeTotal())
// Should equal: sum of all totalPrice values in memory
```

### Trace Event Addition
```javascript
// In each handler
console.log('Adding event:', eventType, { services, totalPrice })
console.log('Memory after add:', eventServicesMemory)
```

## Performance Notes

### Memory Efficiency
- O(1) event lookup by eventType
- O(n) calculation where n = number of selected events
- No performance issues for reasonable selection sizes

### State Updates
- Each handler updates only one event entry
- No full object cloning needed
- Efficient for React batching

## Future Improvements

1. **Persistent Storage**: Save memory to localStorage
2. **Undo/Redo**: Maintain history of memory states
3. **Budget Limits**: Add validation against budget caps
4. **Analytics**: Track budget breakdown by category
5. **Export**: Generate detailed budget report

## Summary

The budget tracking system provides:
- ✓ Accurate, non-duplicated budget totals
- ✓ Persistent selections across navigation
- ✓ Single source of truth
- ✓ Efficient state management
- ✓ Race condition prevention
- ✓ Consistent user experience
