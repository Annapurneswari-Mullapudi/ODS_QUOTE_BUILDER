# Complete Quotation Builder Flow with Budget Tracking

## Overview
This document shows the complete user journey through the quotation builder with budget tracking at each step.

## Full Navigation Flow with Budget States

### Step 1: Event Selection (1.1)
```
Page: EventSelection
Action: Select "Wedding"
Memory Update: None (just selecting event type)
Current Budget: ₹0
Total Budget: ₹0
```

### Step 2: Wedding Services Selection (1.2)
```
Page: ServicesSelectionScreen (wedding)
Action: Select Traditional Photo (₹9,000) + Candid Video (₹16,000)
Memory Update:
  wedding: { 
    services: ['traditional-photo', 'candid-video'],
    totalPrice: 25000
  }
Current Budget (Wedding): ₹25,000
Total Budget: ₹25,000
```

### Step 3: Pre-Wedding Confirmation (2.1)
```
Page: EventConfirmation (pre-wedding)
Display: "Do you want us to cover your Pre-Wedding?"
Current Budget: ₹25,000 (unchanged - no new services)
Total Budget: ₹25,000
```

#### Option A: User Says YES
```
Action: Click YES
Finalize: pre-wedding added to finalizedEvents
Navigate: → 2.2 (Pre-Wedding Duration)
```

#### Option B: User Says NO
```
Action: Click NO
Finalize: Skip pre-wedding
Navigate: → 3.1 (Engagement Confirmation)
```

### Step 4a: Pre-Wedding Duration (2.2) - If User Said YES
```
Page: PreWeddingDuration
Action: Select "Full-day" (₹45,000)
Store: preWeddingDurationPrice = 45000
Navigate: → 2.3
```

### Step 4b: Pre-Wedding Services (2.3) - If User Said YES
```
Page: ServicesSelectionScreen (pre-wedding with budget ₹45,000)
Action: Select Candid Photo (₹12,000) + Drone (₹10,000)
         Budget allows (₹22,000 < ₹45,000)
Memory Update:
  pre-wedding: {
    services: ['candid-photo', 'drone'],
    totalPrice: 22000  // Uses actual service prices, not duration
  }
Current Budget (Pre-Wedding): ₹22,000
Total Budget: ₹25,000 + ₹22,000 = ₹47,000
Navigate: → 3.1
```

### Step 5: Engagement Confirmation (3.1)
```
Page: EventConfirmation (engagement)
Display: "Do you want us to cover your Engagement?"
Memory State:
  wedding: { totalPrice: 25000 }
  pre-wedding: { totalPrice: 22000 }
Total Budget: ₹47,000 (persisted, unchanged)
```

#### User Says YES:
```
Memory Update: engagement added to finalizedEvents
Navigate: → 3.2
```

### Step 6: Engagement Services (3.2) - If User Said YES
```
Page: ServicesSelectionScreen (engagement)
Action: Select Traditional Photo (₹9,000) + Traditional Video (₹14,000)
Memory Update:
  engagement: {
    services: ['traditional-photo', 'traditional-video'],
    totalPrice: 23000
  }
Memory State:
  wedding: { totalPrice: 25000 }
  pre-wedding: { totalPrice: 22000 }
  engagement: { totalPrice: 23000 }
Total Budget: ₹25,000 + ₹22,000 + ₹23,000 = ₹70,000
Navigate: → 4.1
```

## Continuing Pattern for Remaining Events

### Events 4-12 Follow Same Pattern
Each event cycle:
1. **Confirmation Screen**: Ask YES/NO
2. **If YES**: Services Selection Screen
   - User selects services
   - Price added to memory
   - Total budget updates
3. **If NO**: Skip to next event confirmation

### Event Totals for Typical Full Wedding
```
1. Wedding: ₹25,000 (Trad Photo + Candid Video)
2. Pre-Wedding: ₹22,000 (Candid Photo + Drone)
3. Engagement: ₹23,000 (Trad Photo + Trad Video)
4. Groom: ₹28,000 (Trad Photo + Trad Video + Candid Video)
5. Groom Haldi: ₹20,000 (Trad Photo + Candid Video)
6. Bride Making: ₹28,000 (Trad Photo + Trad Video + Candid Video)
7. Bride Haldi: ₹20,000 (Trad Photo + Candid Video)
8. Reception: ₹37,000 (All services)
9. Vratham: ₹23,000 (Trad Photo + Trad Video)
10. Sangeeth: ₹28,000 (Trad Photo + Trad Video + Candid Photo + Candid Video)
11. Mehandi: ₹28,000 (Trad Photo + Trad Video + Candid Photo + Candid Video)
12. After-Party: ₹37,000 (Trad Photo + Trad Video + Candid Photo + Candid Video + Drone)

Running Total: ₹25,000 → ₹47,000 → ₹70,000 → ₹98,000 → ₹118,000 → 
               ₹146,000 → ₹166,000 → ₹203,000 → ₹226,000 → ₹254,000 → 
               ₹282,000 → ₹319,000
```

### Step 13: Post-Wedding Confirmation (13.1)
```
Page: EventConfirmation (post-wedding)
Display: "Do you want us to cover your Post-Wedding Shoot?"
Total Budget: ₹319,000 (all previous events preserved)
User Says: YES
```

### Step 14: Post-Wedding Duration (13.2)
```
Page: PostWeddingDuration
Action: Select "2-days" (₹40,000)
Store: postWeddingDurationPrice = 40000
Navigate: → 13.3
```

### Step 15: Post-Wedding Services (13.3)
```
Page: ServicesSelectionScreen (post-wedding with budget ₹40,000)
Action: Select Candid Photo (₹12,000) + Candid Video (₹16,000)
         Budget allows (₹28,000 < ₹40,000)
Memory Update:
  post-wedding: {
    services: ['candid-photo', 'candid-video'],
    totalPrice: 28000
  }
Total Budget: ₹319,000 + ₹28,000 = ₹347,000
Navigate: → 14.1
```

### Step 16: Album Confirmation (14.1)
```
Page: EventConfirmation (album)
Display: "Do you need an Album?"
Total Budget: ₹347,000 (preserved)
User Says: YES
Navigate: → 14.2
```

### Step 17: Album Size (14.2)
```
Page: AlbumSize
Action: Select "Large Album"
Store: albumSize = 'large'
Navigate: → 14.3
```

### Step 18: Album Delivery Time (14.3)
```
Page: AlbumDeliveryTime
Action: Select "1 Month" (₹40,000)
Memory Update:
  album: {
    services: ['one-month'],
    totalPrice: 40000
  }
Memory State (Final):
  wedding: { totalPrice: 25000 }
  pre-wedding: { totalPrice: 22000 }
  engagement: { totalPrice: 23000 }
  groom: { totalPrice: 28000 }
  groom-haldi: { totalPrice: 20000 }
  bride-making: { totalPrice: 28000 }
  bride-haldi: { totalPrice: 20000 }
  reception: { totalPrice: 37000 }
  vratham: { totalPrice: 23000 }
  sangeeth: { totalPrice: 28000 }
  mehandi: { totalPrice: 28000 }
  after-party: { totalPrice: 37000 }
  post-wedding: { totalPrice: 28000 }
  album: { totalPrice: 40000 }

Total Budget: ₹387,000
Navigate: → Final Quote Summary
```

## Final Quote Summary

```
Page: QuoteSummary

Your Complete Quote

1. The Wedding Ceremony - ₹25,000
   • Traditional Photo
   • Candid Video

2. The Pre-Wedding - ₹22,000
   • Candid Photo
   • Drone

3. The Engagement - ₹23,000
   • Traditional Photo
   • Traditional Video

4. The Groom Making - ₹28,000
   • Traditional Photo
   • Traditional Video
   • Candid Video

5. The Groom Haldi - ₹20,000
   • Traditional Photo
   • Candid Video

6. The Bride Making - ₹28,000
   • Traditional Photo
   • Traditional Video
   • Candid Video

7. The Bride Haldi - ₹20,000
   • Traditional Photo
   • Candid Video

8. The Reception - ₹37,000
   • All services selected

9. The Vratham - ₹23,000
   • Traditional Photo
   • Traditional Video

10. The Sangeeth - ₹28,000
    • Traditional Photo
    • Traditional Video
    • Candid Photo
    • Candid Video

11. The Mehandi Function - ₹28,000
    • Traditional Photo
    • Traditional Video
    • Candid Photo
    • Candid Video

12. The After-Party - ₹37,000
    • Traditional Photo
    • Traditional Video
    • Candid Photo
    • Candid Video
    • Drone

13. The Post-Wedding Shoot - ₹28,000
    • Candid Photo
    • Candid Video

14. The Album - ₹40,000
    • 1 Month Album Delivery

═════════════════════════════════════════
Total Budget: ₹387,000
═════════════════════════════════════════
```

## Back Navigation with Budget Persistence

### Scenario: User at Step 14.3 Goes Back

```
Current: 14.3 (Album Delivery Time) - Budget: ₹387,000
↓ Click BACK
Previous: 14.2 (Album Size) - Budget: ₹347,000 (album not finalized yet)
↓ Click BACK
Previous: 14.1 (Album Confirmation) - Budget: ₹347,000 (album in memory)
↓ Click BACK
Previous: 13.3 (Post-Wedding Services) - Budget: ₹319,000 (post-wedding remembered)
↓ Click BACK
Previous: 13.2 (Post-Wedding Duration) - Budget: ₹319,000 (duration remembered)
↓ Click BACK
Previous: 13.1 (Post-Wedding Confirmation) - Budget: ₹319,000
↓ Click BACK
Previous: 12.2 (After-Party Services) - Budget: ₹282,000 (after-party still in memory)
```

### Key Points on Back Navigation
1. **Memory Persists**: All selections remain in eventServicesMemory
2. **Budget Stable**: Total never changes unexpectedly
3. **Edit Capability**: User can re-select services and budget updates correctly
4. **No Duplication**: Going back doesn't duplicate budgets

## Typical Error Scenarios Prevented

### Scenario 1: Budget Duplication
```
❌ PREVENTED:
  User goes: Service Selection → Confirmation → Edit Service Selection
  Budget added twice?
  
✓ FIXED:
  eventServicesMemory['wedding'] overwrites previous entry
  Budget added only once
```

### Scenario 2: Missing Budget on Back Navigation
```
❌ PREVENTED:
  User goes: Select Services → Continue → Go Back
  Budget disappeared?
  
✓ FIXED:
  eventServicesMemory calculated from ALL entries, not finalized only
  Budget persists
```

### Scenario 3: Stale State Updates
```
❌ PREVENTED:
  Handler using eventServicesMemory directly
  Race condition possible
  
✓ FIXED:
  Using functional update: setEventServicesMemory(prev => ...)
  Always working with current state
```

## Budget Calculation Flow

```
User Actions
    ↓
handleServiceNext() → serviceNext() handler
    ↓
Store in eventServicesMemory using functional update
    ↓
Pass to onNext prop → calculateCumulativeTotal()
    ↓
Display on screen
    ↓
Back to eventServicesMemory (single source of truth)
```

## Quick Reference: Events and Their Steps

| Event | Confirmation Step | Services Step | Duration Step |
|-------|------------------|---------------|---------------|
| Wedding | - | 1.2 | - |
| Pre-Wedding | 2.1 | 2.3 | 2.2 |
| Engagement | 3.1 | 3.2 | - |
| Groom | 4.1 | 4.2 | - |
| Groom Haldi | 5.1 | 5.2 | - |
| Bride Making | 6.1 | 6.2 | - |
| Bride Haldi | 7.1 | 7.2 | - |
| Reception | 8.1 | 8.2 | - |
| Vratham | 9.1 | 9.2 | - |
| Sangeeth | 10.1 | 10.2 | - |
| Mehandi | 11.1 | 11.2 | - |
| After-Party | 12.1 | 12.2 | - |
| Post-Wedding | 13.1 | 13.3 | 13.2 |
| Album | 14.1 | - | - |
| Delivery Time | - | - | 14.3 |

## Summary

✓ **Budget never duplicates** - Single entry per event  
✓ **Selections persist** - Memory maintained across navigation  
✓ **Total always accurate** - Calculated from all memory entries  
✓ **No stale closures** - Functional updates used throughout  
✓ **Clean UI display** - Quote summary builds from complete memory  
✓ **Back navigation safe** - All data preserved during back flow  
