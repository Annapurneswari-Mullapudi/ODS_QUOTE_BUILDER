# Duration-Based Pricing System

## Overview

The quotation builder uses two different pricing models:

1. **Service-Based Pricing** (Regular Events): Price = Sum of selected services
2. **Duration-Based Pricing** (Pre-Wedding & Post-Wedding): Price = Duration option selected

## Budget Calculation Rules

### Regular Events (Service-Based)
Events like Wedding, Engagement, Groom, Bride Making, etc.

```
Budget = Sum of selected services
- Traditional Photo: ₹9,000
- Traditional Video: ₹14,000
- Candid Photo: ₹12,000
- Candid Video: ₹16,000
- Drone: ₹10,000
- Audience Video: ₹8,000

Example: Selecting Photo + Video = ₹23,000
```

### Duration-Based Events (Pre-Wedding & Post-Wedding)
These events have TWO steps:

#### Step 1: Select Duration (Fixed Price)
- **Pre-Wedding Duration Options** (Step 2.2):
  - 3-hours: ₹20,000
  - 6-hours: ₹30,000
  - Full-day: ₹45,000

- **Post-Wedding Duration Options** (Step 13.2):
  - 1-day: ₹25,000
  - 2-days: ₹40,000
  - 3-days: ₹55,000

**This is the ONLY price added to the total budget.**

#### Step 2: Select Services (For Reference Only)
- **Pre-Wedding Services** (Step 2.3):
  - User selects which types of coverage (Candid Photo, Candid Video, Drone)
  - NO PRICES shown for individual services
  - NO ADDITIONAL PRICE added to total budget
  - Services are just for reference/documentation

- **Post-Wedding Services** (Step 13.3):
  - User selects which types of coverage (Candid Photo, Candid Video, Drone)
  - NO PRICES shown for individual services
  - NO ADDITIONAL PRICE added to total budget
  - Services are just for reference/documentation

## Complete Budget Flow Example

### Scenario: Full Wedding with Pre-Wedding

```
Step 1.1: Event Selection
  Select: Wedding
  Budget Added: ₹0 (just selecting type)
  Total: ₹0

Step 1.2: Wedding Services
  Select: Traditional Photo + Candid Video (₹9,000 + ₹16,000)
  Budget Added: ₹23,000
  Total: ₹23,000 ✓

Step 2.1: Pre-Wedding Confirmation
  Answer: YES
  Budget Added: ₹0 (just confirming)
  Total: ₹23,000 ✓

Step 2.2: Pre-Wedding Duration ⭐ DURATION PRICING
  Select: 6-hours (₹30,000)
  Budget Added: ₹30,000 ⭐ THIS IS THE ONLY PRICE
  Total: ₹53,000 ✓

Step 2.3: Pre-Wedding Services 🚫 NO PRICING
  Select: Candid Photo + Drone
  Budget Added: ₹0 🚫 (Services already covered by duration)
  Budget Shown: ₹30,000 (Duration price, not service prices)
  Total: ₹53,000 ✓ (No change!)

Step 3.1: Engagement Confirmation
  Answer: YES
  Budget Added: ₹0
  Total: ₹53,000 ✓

Step 3.2: Engagement Services
  Select: Traditional Photo + Traditional Video (₹9,000 + ₹14,000)
  Budget Added: ₹23,000
  Total: ₹76,000 ✓

... (continue with other events)

Step 13.2: Post-Wedding Duration ⭐ DURATION PRICING
  Select: 2-days (₹40,000)
  Budget Added: ₹40,000 ⭐ THIS IS THE ONLY PRICE
  Total: ₹XXX,000 ✓

Step 13.3: Post-Wedding Services 🚫 NO PRICING
  Select: Candid Photo + Candid Video
  Budget Added: ₹0 🚫 (Services already covered by duration)
  Budget Shown: ₹40,000 (Duration price, not service prices)
  Total: ₹XXX,000 ✓ (No change!)

Step 14.3: Final Quote
  Total Budget: ₹XXX,000 ✓ (All duration prices included, no duplication)
```

## Implementation Details

### Pre-Wedding Flow (Steps 2.1 - 2.3)

```javascript
// Step 2.1: Confirmation
onNext(option) → if YES:
  handleConfirmationNext('yes', 'pre-wedding')
    ↓
  Navigate to Step 2.2 (Duration Selection)

// Step 2.2: Duration Selection
handlePreWeddingDurationNext(durationId, durationPrice)
  ↓
  setPreWeddingDurationPrice(durationPrice)  // ⭐ Store duration price
  ↓
  Navigate to Step 2.3 (Services Selection)

// Step 2.3: Services Selection (with hideServicePrices=true)
handlePreWeddingServiceNext(services, totalPrice)
  ↓
  ✅ Store services (for reference): { services: [...] }
  ✅ Store price: { totalPrice: preWeddingDurationPrice } ⭐ USE DURATION PRICE!
  ↓
  eventServicesMemory['pre-wedding'] = {
    services: ['candid-photo', 'drone'],
    totalPrice: 30000  // ⭐ Duration price, NOT service prices
  }
  ↓
  Navigate to Step 3.1
```

### Post-Wedding Flow (Steps 13.1 - 13.3)

Same pattern as pre-wedding:

```javascript
// Step 13.1: Confirmation → YES
// Step 13.2: Duration Selection → Store duration price
// Step 13.3: Services Selection → Store duration price (not service prices)

handlePostWeddingServiceNext(services, totalPrice)
  ↓
  eventServicesMemory['post-wedding'] = {
    services: ['candid-photo', 'candid-video'],
    totalPrice: 40000  // ⭐ Duration price, NOT service prices
  }
```

### Budget Calculation in ServicesSelectionScreen

```javascript
// For regular events (hideServicePrices = false)
const eventsTotalPrice = cumulativeTotalPrice + totalPrice
  ↑ Adds individual service prices

// For duration events (hideServicePrices = true)
const eventsTotalPrice = cumulativeTotalPrice + eventBudget
  ↑ Adds duration price (passed as eventBudget prop)
```

## UI Display Logic

### Step 2.2 (Duration Selection)
```
Display: "Select Pre-Wedding Duration"
Shows: 3-hours (₹20,000), 6-hours (₹30,000), Full-day (₹45,000)
Price Visible: ✓ Yes (so user can see what they're choosing)
Budget Impact: ✓ Immediately added to total
```

### Step 2.3 (Services Selection - hideServicePrices = true)
```
Display: "Pre-Wedding Services"
Shows: Candid Photo, Candid Video, Drone (NO prices)
Price Per Service: ✗ Hidden (no individual prices shown)
Budget Shown: ₹30,000 (the duration price from step 2.2)
Budget Impact: ✗ None (already added at step 2.2)
Services Array: Selected services stored for reference only
```

## Quote Summary Display

```
Pre-Wedding Event:
├─ Services: Candid Photo, Candid Video, Drone
├─ Total Price: ₹30,000 ⭐ (Duration price)
└─ Note: Price covers entire duration (6-hours in this case)

Post-Wedding Event:
├─ Services: Candid Photo, Candid Video
├─ Total Price: ₹40,000 ⭐ (Duration price)
└─ Note: Price covers entire duration (2-days in this case)
```

## Key Points

### ✅ What IS Added to Budget
1. Service prices for regular events (Wedding, Engagement, etc.)
2. Duration prices for pre-wedding (Step 2.2)
3. Duration prices for post-wedding (Step 13.2)
4. Album delivery price (Step 14.3)

### ❌ What IS NOT Added to Budget
1. Services at Step 2.3 (pre-wedding services) - NO prices
2. Services at Step 13.3 (post-wedding services) - NO prices
3. Confirmation screens (Step X.1) - NO prices

### 🔒 Budget Persistence
- Once duration price added at Step 2.2, it persists through Step 2.3
- User can change services at 2.3 without affecting budget
- Budget stays same even if user goes back to 2.2 and changes duration
- Final quote includes all duration prices exactly once

## Common Scenarios

### Scenario 1: Changing Pre-Wedding Duration
```
User at 2.2: Selects "6-hours" (₹30,000)
Total Budget: ₹30,000

User goes back to 2.2: Changes to "Full-day" (₹45,000)
At 2.3 Services: Shows ₹45,000
Total Budget: ₹45,000 ✓ (Updated correctly)

Final Quote: Shows Full-day (₹45,000) ✓
```

### Scenario 2: Changing Services at 2.3
```
User at 2.3: Selects "Candid Photo" + "Drone"
Budget Shown: ₹30,000 (unchanged)
Total Budget: ₹X,000 (unchanged)

User at 2.3: Changes to "Candid Video" only
Budget Shown: ₹30,000 (unchanged)
Total Budget: ₹X,000 (unchanged)

Final Quote: Shows selected services (for reference)
             Price: ₹30,000 (duration price)
             Services listed: Whatever was selected at 2.3
```

### Scenario 3: Full Navigation with Pre & Post Wedding
```
1. Wedding services: ₹25,000
2. Pre-wedding duration (6-hours): ₹30,000 (added)
3. Pre-wedding services: (no price change)
   Total: ₹55,000
4. [Other events: ₹100,000]
5. Post-wedding duration (2-days): ₹40,000 (added)
6. Post-wedding services: (no price change)
   Total: ₹195,000
7. Album: ₹40,000
   Final Total: ₹235,000

✓ Each duration price added exactly once
✓ No service prices added at 2.3 or 13.3
✓ Services shown in quote for reference only
```

## Code Implementation

### How Duration Price is Passed

```javascript
// App.jsx - State
const [preWeddingDurationPrice, setPreWeddingDurationPrice] = useState(0)

// Step 2.2 Handler
const handlePreWeddingDurationNext = (durationId, durationPrice) => {
  setPreWeddingDurationPrice(durationPrice)  // ⭐ Store it
  handleNavigateToNext('pre-wedding-services')
}

// Step 2.3 Rendering
if (currentPage === 'pre-wedding-services') {
  return (
    <ServicesSelectionScreen
      eventType="pre-wedding"
      cumulativeTotalPrice={calculateCumulativeTotal()}
      eventBudget={preWeddingDurationPrice}  // ⭐ Pass duration price
      hideServicePrices={true}               // ⭐ Hide service prices
      onNext={handlePreWeddingServiceNext}
    />
  )
}

// Step 2.3 Handler
const handlePreWeddingServiceNext = (services, totalPrice) => {
  // ⭐ IMPORTANT: Use duration price, not service total price
  setEventServicesMemory(prev => ({
    ...prev,
    'pre-wedding': { 
      services, 
      totalPrice: preWeddingDurationPrice  // ⭐ Duration price!
    }
  }))
  handleNavigateToNext('engagement-confirmation')
}
```

### ServicesSelectionScreen Logic

```javascript
// When hideServicePrices = true (pre/post-wedding services)
if (hideServicePrices && eventBudget) {
  // Display duration price
  budgetDisplay = eventBudget  // ₹30,000 or ₹40,000
  
  // Add duration price to total (not service prices)
  totalBudget = cumulativeTotalPrice + eventBudget
}

// When hideServicePrices = false (regular events)
else {
  // Display service prices
  budgetDisplay = totalPrice  // Sum of selected services
  
  // Add service prices to total
  totalBudget = cumulativeTotalPrice + totalPrice
}
```

## Summary

| Aspect | Regular Events | Duration Events |
|--------|---|---|
| **Examples** | Wedding, Engagement, Groom | Pre-Wedding, Post-Wedding |
| **Step 1** | Services Selection | Duration Selection ⭐ |
| **Step 2** | (Final for that event) | Services Selection |
| **Pricing** | Sum of services | Duration price only |
| **Budget Added** | At Step 2 (services) | At Step 2a (duration) |
| **Services Budget** | Individual prices shown | ✗ No prices shown |
| **Quote Display** | Services with prices | Services listed, duration price |
| **User Flow** | Select services → price | Select duration → services → price fixed |

---

**Version**: 1.0  
**Status**: ✅ Implemented & Working  
**Last Updated**: 2026-08-24
