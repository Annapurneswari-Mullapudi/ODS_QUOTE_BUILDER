# Finalized Events Tracking System

## Overview

The system tracks which events have been **confirmed by the user** (when they say YES to "Do you want this event?"). Only these finalized events count toward the budget and appear in the final quote.

## Visual Flow

```
User Journey with Event Finalization:

┌─────────────────────────┐
│ 1.1 Event Selection     │
│ Select: Wedding         │
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│ 1.2 Wedding Services    │
│ finalizedEvents: {}     │
│ Budget: ₹0              │
└─────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ 2.1 Pre-Wedding Confirmation    │
│ "Do you want Pre-Wedding?"      │
│                                 │
├─ Click YES ──────┐              │
│                  │              │
│                  ▼              │
│          Add to finalizedEvents │
│          finalizedEvents:       │
│          Set['pre-wedding']     │
│          Budget: ₹30,000 ✅     │
│                  │              │
│                  ▼              │
│          Step 2.2 Duration      │
│          Step 2.3 Services      │
│                  │              │
└─ Click NO ───────┼──────────────┘
                   │
                   ▼ Skip event
        ┌──────────────────┐
        │ 3.1 Engagement   │
        │ NOT finalized    │
        │ Budget: ₹30,000  │
        └──────────────────┘
```

## State Management

### Before Finalization

```javascript
// User at step 1.2, selected services but NOT confirmed yet
eventServicesMemory = {
  'wedding': { services: ['photo', 'video'], totalPrice: 25000 }
}

finalizedEvents = Set[] // Empty - not confirmed yet

calculateCumulativeTotal() = 0 // Not counted!
```

### After Finalization (YES Response)

```javascript
// User at step 2.1, said YES to pre-wedding
eventServicesMemory = {
  'wedding': { services: ['photo', 'video'], totalPrice: 25000 },
  'pre-wedding': { services: ['candid-photo', 'drone'], totalPrice: 30000 }
}

finalizedEvents = Set['pre-wedding'] // NOW it's finalized!

calculateCumulativeTotal():
  // ✅ Loops through finalizedEvents only
  pre-wedding: 30000
  Total: 30000 ✓
```

### When User Navigates Back

```javascript
// User goes back to step 1.2 to edit wedding
eventServicesMemory = {
  'wedding': { services: ['photo', 'video', 'drone'], totalPrice: 35000 }, // Updated
  'pre-wedding': { services: ['candid-photo', 'drone'], totalPrice: 30000 }
}

finalizedEvents = Set['pre-wedding'] // Unchanged!

calculateCumulativeTotal():
  // ✅ Only counts finalized events
  pre-wedding: 30000
  Total: 30000 ✓ (Wedding NOT counted - not finalized yet)
```

### When Multiple Events Finalized

```javascript
// User progressed through multiple events
eventServicesMemory = {
  'wedding': { totalPrice: 35000 },
  'pre-wedding': { totalPrice: 30000 },
  'engagement': { totalPrice: 23000 },
  'groom': { totalPrice: 28000 },
  'groom-haldi': { totalPrice: 20000 }
}

finalizedEvents = Set['wedding', 'pre-wedding', 'engagement']
// Note: groom and groom-haldi NOT finalized (user didn't reach them or said NO)

calculateCumulativeTotal():
  // ✅ Only counts finalized events
  wedding: 35000
  pre-wedding: 30000
  engagement: 23000
  Total: 88000 ✓ (groom and groom-haldi NOT counted)
```

## No Duplication Guarantee

```
Scenario: User edits wedding, goes back/forward multiple times

Step 1.2: Wedding (₹25,000)
          finalizedEvents: []
          Total: ₹0

Step 2.1: Say YES to pre-wedding
          finalizedEvents: ['pre-wedding']
          
Step 2.2: Select 6-hours (₹30,000)
          Total: ₹30,000

Step 2.3: Select services
          Total: ₹30,000 (pre-wedding finalized)

BACK to Step 1.2
          Edit wedding to ₹35,000
          Total: ₹30,000 (still only pre-wedding counts)

FORWARD to Step 2.2
          Total: ₹30,000 (pre-wedding still only counts once)

FORWARD to Step 2.3
          Total: ₹30,000 (pre-wedding still only counts once)

❌ Wedding NOT counted because NOT finalized
✅ Pre-wedding counted exactly ONCE
✅ NO DUPLICATION
```

## How Events Get Finalized

### Event Confirmation Pattern

All events follow this pattern:

```javascript
// Step X.1: Confirmation Screen
const handleConfirmationNext = (option, eventType) => {
  if (option === 'yes') {
    // ✅ FINALIZE THE EVENT
    const newFinalized = new Set(finalizedEvents)
    newFinalized.add(eventType)
    setFinalizedEvents(newFinalized)  // ⭐ Event now finalized!
    
    // Navigate to services/duration selection
    handleNavigateToNext(nextPage)
  } else {
    // ❌ Event NOT finalized
    // Skip to next event
    handleNavigateToNext(skipPage)
  }
}
```

### Event Types & Finalization

```
Regular Events (Services-Based):
  1.2 Wedding
    ├─ Step 1.1: No finalization
    └─ Step 1.2: Selected but NOT finalized
              Budget: ₹0

  2.1 Pre-Wedding Confirmation
    ├─ YES ──→ finalizedEvents.add('pre-wedding')
    │         Now ✅ finalized
    │         Budget: ₹30,000
    │
    └─ NO ──→ Not finalized
              Skip to engagement
              Budget: Unchanged

Duration Events:
  2.2 Pre-Wedding Duration
    ├─ Select: 6-hours (₹30,000)
    └─ Store: preWeddingDurationPrice = 30000

  2.3 Pre-Wedding Services
    └─ Finalized at step 2.1 ✓
       Uses preWeddingDurationPrice
       No additional budget
```

## Quote Summary Includes Only Finalized

```javascript
if (currentPage === 'quote-summary') {
  // ✅ CORRECT - Only include finalized events
  const quoteEvents = Array.from(finalizedEvents).map(eventType => ({
    eventType,
    services: eventServicesMemory[eventType]?.services || [],
    totalPrice: eventServicesMemory[eventType]?.totalPrice || 0
  }))
  
  // Result: Quote shows ONLY what user confirmed (YES responses)
}
```

### Example Quote

```
User Journey:
1.1 Select Wedding
1.2 Select services (₹25,000) - NOT finalized yet
2.1 Say YES to Pre-Wedding → ✅ FINALIZED
2.2 Select 6-hours (₹30,000)
2.3 Select services
3.1 Say YES to Engagement → ✅ FINALIZED
3.2 Select services (₹23,000)
4.1 Say NO to Groom → ❌ NOT FINALIZED
5.1 Say YES to Groom Haldi → ✅ FINALIZED
5.2 Select services (₹20,000)

finalizedEvents = Set['pre-wedding', 'engagement', 'groom-haldi']

Final Quote Shows:
├─ Pre-Wedding: ₹30,000 ✓ (finalized)
├─ Engagement: ₹23,000 ✓ (finalized)
└─ Groom Haldi: ₹20,000 ✓ (finalized)

NOT included:
├─ Wedding (only selected services, never confirmed)
└─ Groom (user said NO)

Total: ₹73,000 ✓
```

## Troubleshooting

### Issue: Event not counting to budget
**Check**: Is event in `finalizedEvents`?
- If NO: User never said YES at confirmation
- If YES: Should be counted, check memory

### Issue: Budget duplicating
**Check**: Count of events in `finalizedEvents`
- Should be: Number of events user confirmed (YES responses)
- If higher: Multiple entries for same event (shouldn't happen)

### Issue: Quote missing events
**Check**: Compare `finalizedEvents` with quote
- Quote should match `finalizedEvents` exactly
- If different: Check quote summary logic

## Performance

```
Budget Calculation:
  - Loop through: finalizedEvents (small set)
  - Time: O(n) where n = finalized events
  - Space: O(n) for tracking
  
Quote Building:
  - Loop through: finalizedEvents (small set)
  - Time: O(n) where n = finalized events
  - Space: O(n) for quote array

Benefits:
  ✅ Only process confirmed events
  ✅ Skip unconfirmed events
  ✅ Faster than iterating all events
```

## Key Invariants

```
ALWAYS TRUE:
  ✓ finalizedEvents ⊆ eventServicesMemory keys
    (All finalized events have memory entries)
  
  ✓ Events added to finalizedEvents only on YES response
    (Never added before confirmation)
  
  ✓ Events never removed from finalizedEvents
    (Once confirmed, stays confirmed)
  
  ✓ Each event in finalizedEvents counted exactly once
    (No duplication possible)
  
  ✓ Quote includes exactly finalizedEvents
    (Quote matches what's finalized)
```

## Summary

| Aspect | Implementation |
|--------|---|
| **Tracking** | `finalizedEvents` Set of confirmed events |
| **Adding** | When user says YES to confirmation |
| **Budget** | Sum of only finalized events |
| **Quote** | Built from only finalized events |
| **Duplication** | Impossible - each event counted once |
| **Back Navigation** | Budget stays consistent |
| **Edit Safety** | Non-finalized events never counted |

---

**System**: Finalized Events Tracking  
**Status**: ✅ Implemented & Working  
**Version**: 1.0  
**Date**: 2026-08-24
