# Budget Flow Diagram

## Memory State Diagram

```
                         EVENT SERVICES MEMORY
                      (Single Source of Truth)
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
            wedding       pre-wedding   engagement
          {              {               {
            services:      services:       services:
            ['photo',      ['photo',       ['trad-photo',
             'video']      'drone']        'trad-video']
            price:         price:          price:
            ₹21,000        ₹22,000         ₹23,000
          }              }                }
                │             │             │
                └─────────────┼─────────────┘
                              │
                              ▼
                    calculateCumulativeTotal()
                              │
                        Sum of all prices:
                        ₹21,000 + ₹22,000 + ₹23,000 + ...
                              │
                              ▼
                    Display as Total Budget
```

## Data Flow: User Selection → Memory → Display

```
User Selects Services
        │
        ▼
handleServiceNext()
        │
        ├─ Store: setEventServicesMemory(prev => ({
        │   ...prev,
        │   [eventType]: { services, totalPrice }
        │ }))
        │
        ├─ Update: navigationHistory
        │
        └─ Navigate: handleNavigateToNext(nextPageId)
        │
        ▼
Next Page Renders
        │
        ├─ Reads: eventServicesMemory (from props)
        │
        ├─ Calculates: calculateCumulativeTotal()
        │
        └─ Displays: Total budget on screen
```

## Budget Accumulation Through Flow

```
Step 1.1: Event Selection
  Memory: {}
  Budget: ₹0

Step 1.2: Wedding Services (User selects 2 services)
  Memory: { wedding: { totalPrice: ₹25,000 } }
  Budget: ₹25,000

Step 2.1: Pre-Wedding Confirmation
  Memory: { wedding: {...} }
  Budget: ₹25,000 (no change - just confirming)

Step 2.2: Pre-Wedding Duration (User selects 6-hours: ₹30,000)
  Memory: { wedding: {...} }
  Budget: ₹25,000 (duration stored, not in services)

Step 2.3: Pre-Wedding Services (User selects 2 services within budget)
  Memory: { 
    wedding: { totalPrice: ₹25,000 },
    pre-wedding: { totalPrice: ₹22,000 }
  }
  Budget: ₹47,000

Step 3.1: Engagement Confirmation
  Memory: (unchanged)
  Budget: ₹47,000

Step 3.2: Engagement Services (User selects 2 services)
  Memory: {
    wedding: { totalPrice: ₹25,000 },
    pre-wedding: { totalPrice: ₹22,000 },
    engagement: { totalPrice: ₹23,000 }
  }
  Budget: ₹70,000

... (continues through all events)

Step 14.3: Album Delivery (User selects 1-month: ₹40,000)
  Memory: {
    wedding: { totalPrice: ₹25,000 },
    pre-wedding: { totalPrice: ₹22,000 },
    engagement: { totalPrice: ₹23,000 },
    ... (all events)
    post-wedding: { totalPrice: ₹28,000 },
    album: { totalPrice: ₹40,000 }
  }
  Budget: ₹387,000

Quote Summary:
  Display: All events with their budgets
  Total: ₹387,000
```

## Back Navigation Budget Persistence

```
Forward Journey:
1.1 (₹0) → 1.2 (₹25K) → 2.1 (₹25K) → 2.2 (₹25K) → 2.3 (₹47K) → 
3.1 (₹47K) → 3.2 (₹70K) → ... → 14.3 (₹387K)

Back Journey:
14.3 (₹387K) → [Back] → 14.2 (₹347K) → [Back] → 14.1 (₹347K) → [Back] →
13.3 (₹319K) → [Back] → 13.2 (₹319K) → [Back] → 13.1 (₹319K) → [Back] →
12.2 (₹282K) → [Back] → ...

Note: Budget decreases as we go back because album not finalized,
      post-wedding partially added, etc. But never disappears!
      Memory always maintains all stored services.
```

## Preventing Duplication: Event Overwrite Mechanism

```
First Selection:
eventServicesMemory = {
  'wedding': { services: ['photo'], totalPrice: ₹9,000 }
}

User goes back and changes selection:
setEventServicesMemory(prev => ({
  ...prev,
  'wedding': { services: ['photo', 'video'], totalPrice: ₹23,000 }
}))

Result:
eventServicesMemory = {
  'wedding': { services: ['photo', 'video'], totalPrice: ₹23,000 }
}
                ↑
        Old data completely replaced, not added!

TOTAL: ₹23,000 (NOT ₹9,000 + ₹23,000 = ₹32,000)
```

## State Update Pattern - Safe vs Unsafe

### ❌ UNSAFE Pattern (Can Cause Issues)

```javascript
const handleServiceNext = (services, totalPrice) => {
  // Reference to stale state!
  const current = eventServicesMemory
  current['event'] = { services, totalPrice }
  setEventServicesMemory(current) // Mutation!
}
```

**Problems:**
- `eventServicesMemory` might be stale (closure)
- Mutating object directly
- Race conditions possible
- State batching issues

### ✅ SAFE Pattern (Recommended)

```javascript
const handleServiceNext = (services, totalPrice) => {
  setEventServicesMemory(prev => ({
    ...prev,
    [eventType]: { services, totalPrice }
  }))
}
```

**Benefits:**
- Always uses current state via `prev`
- Creates new object (immutable)
- No race conditions
- React batching works correctly

## Total Calculation: Old vs New

### ❌ OLD Method (Loses Data)

```javascript
const calculateCumulativeTotal = () => {
  let total = 0
  // Only loops through finalized events
  finalizedEvents.forEach(eventType => {
    if (eventServicesMemory[eventType]) {
      total += eventServicesMemory[eventType].totalPrice
    }
  })
  return total
}

Example:
  eventServicesMemory = {
    wedding: ₹25,000,
    pre-wedding: ₹22,000,
    engagement: ₹23,000
  }
  
  finalizedEvents = [wedding]  // Only wedding finalized
  
  Calculation:
    total = ₹25,000  (only wedding counted!)
    
  Result: ₹25,000 ❌ WRONG! (Lost ₹45,000)
```

### ✅ NEW Method (Preserves All)

```javascript
const calculateCumulativeTotal = () => {
  let total = 0
  // Loops through ALL events in memory
  Object.keys(eventServicesMemory).forEach(eventType => {
    if (eventServicesMemory[eventType]) {
      total += eventServicesMemory[eventType].totalPrice
    }
  })
  return total
}

Example:
  eventServicesMemory = {
    wedding: ₹25,000,
    pre-wedding: ₹22,000,
    engagement: ₹23,000
  }
  
  Calculation:
    total = ₹25,000 + ₹22,000 + ₹23,000
    
  Result: ₹70,000 ✅ CORRECT! (All events counted)
```

## Quote Summary Construction

### ❌ OLD Method (Loses Services)

```javascript
// Only includes finalized events
const quoteEvents = Array.from(finalizedEvents).map(eventType => ({
  eventType,
  services: eventServicesMemory[eventType]?.services || [],
  totalPrice: eventServicesMemory[eventType]?.totalPrice || 0
}))

If finalizedEvents = [wedding] but memory has [wedding, engagement]:
  Quote would only show wedding!
  Engagement services lost!
```

### ✅ NEW Method (Includes All)

```javascript
// Includes all events in memory
const quoteEvents = Object.keys(eventServicesMemory).map(eventType => ({
  eventType,
  services: eventServicesMemory[eventType]?.services || [],
  totalPrice: eventServicesMemory[eventType]?.totalPrice || 0
}))

If memory = {wedding: {...}, engagement: {...}}:
  Quote shows both wedding and engagement!
  No services lost!
```

## Navigation History Stack

```
Starting: []

After selecting Wedding:
["event-selection"]

After selecting Wedding Services:
["event-selection", "service-selection"]

After Pre-Wedding Confirmation (NO):
["event-selection", "service-selection", "pre-wedding-confirmation"]

At Engagement Services (Step 3.2):
["event-selection", "service-selection", "pre-wedding-confirmation", 
 "engagement-confirmation", "engagement-services"]

User Clicks BACK at 3.2:
Pop from history → "engagement-confirmation"
Navigate to: "engagement-confirmation"
History becomes: ["event-selection", "service-selection", 
                  "pre-wedding-confirmation"]

User Clicks BACK at 3.1:
Pop from history → "pre-wedding-confirmation"
Navigate to: "pre-wedding-confirmation"
History becomes: ["event-selection", "service-selection"]
```

## Service Price Mapping

```
┌─ Traditional Photo ───────────── ₹9,000
├─ Traditional Video ──────────── ₹14,000
├─ Candid Photo ─────────────────── ₹12,000
├─ Candid Video ─────────────────── ₹16,000
├─ Drone ────────────────────────── ₹10,000
└─ Audience Video ───────────────── ₹8,000

Duration Pricing:
├─ Pre-Wedding:
│  ├─ 3 hours: ₹20,000
│  ├─ 6 hours: ₹30,000
│  └─ Full day: ₹45,000
│
└─ Post-Wedding:
   ├─ 1 day: ₹25,000
   ├─ 2 days: ₹40,000
   └─ 3 days: ₹55,000

Album Delivery:
├─ 1 Month: ₹40,000
└─ 3 Months: ₹30,000

TOTAL POSSIBLE:
  12 Regular Events × (max 6 services × ₹16,000 each) = ₹1,152,000
  2 Duration Events × ₹55,000 each = ₹110,000
  1 Album × ₹40,000 = ₹40,000
  ────────────────────────────────────
  MAXIMUM: ₹1,302,000
  MINIMUM: ₹0 (all NO responses)
  TYPICAL: ₹300,000 - ₹600,000
```

## Memory Size Analysis

```
Per Event:
  eventType: ~16 bytes (string)
  services: array of strings (~10 bytes × service count)
  totalPrice: 4 bytes (number)
  ─────────────────────────
  Average: ~200 bytes per event

For Full Selection (13 events):
  13 × 200 bytes = ~2.6 KB

Browser Storage Capacity:
  localStorage: 5-10 MB per domain
  sessionStorage: 5-10 MB per session
  Memory usage: Negligible (~2.6 KB out of 1000+ MB available)

Performance Impact: NONE ✓
```

## Summary

| Aspect | Before | After | Improvement |
|--------|--------|-------|-------------|
| Budget Duplication | ✗ Possible | ✓ Impossible | Safer |
| Budget Persistence | ✗ Lost on back | ✓ Always saved | Better UX |
| State Safety | ✗ Race conditions | ✓ Functional updates | More reliable |
| Quote Accuracy | ✗ Incomplete | ✓ Complete | Correct totals |
| Data Integrity | ✗ Vulnerable | ✓ Protected | More trustworthy |

---

**Visualization Created**: 2026-08-24  
**For understanding**: Budget tracking mechanics and data flow
