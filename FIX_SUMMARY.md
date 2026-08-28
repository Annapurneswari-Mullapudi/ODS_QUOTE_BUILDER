# Fix Summary: Extra Service Charges for Pre-Wedding/Post-Wedding

## Problem
QuoteSummary was showing only the duration amount (₹20,000 or ₹40,000) even though users had added extra services with higher quantities in the ServicesSelectionScreen.

**Example:** User selected Pre-Wedding 1-Day (₹20,000) and increased all 3 services to qty=2:
- Expected total: ₹20,000 + (₹8,000 + ₹10,000 + ₹8,000) = ₹46,000
- Was showing: ₹20,000 ❌

## Root Cause
Two issues were discovered:

### Issue 1: ServicesSelectionScreen Display
The display logic wasn't including extra service charges in the price calculation. When `hideServicePrices && eventBudget` was true, it showed only `eventBudget` without adding the calculated extra charges.

### Issue 2: Data Flow (App.jsx)
The handlers `handlePreWeddingServiceNext()` and `handlePostWeddingServiceNext()` were storing `preWeddingDurationPrice` (or `postWeddingDurationPrice`) instead of using the `totalPrice` parameter that now includes extra charges. This meant the QuoteSummary would receive only the base duration price, not the updated total.

## Solution

### Step 1: Fix ServicesSelectionScreen.jsx
**Added `calculateExtraServiceCharges()` function** (line 119-128)
```javascript
const calculateExtraServiceCharges = () => {
  const isPreOrPostWedding = eventType === 'pre-wedding' || eventType === 'post-wedding'
  if (!isPreOrPostWedding) return 0

  let extraCharges = 0
  Array.from(selectedServices).forEach(serviceId => {
    const quantity = serviceQuantities[serviceId] || 1
    const service = allServices.find(s => s.id === serviceId)
    if (service && quantity > 1) {
      extraCharges += service.price * (quantity - 1)
    }
  })
  return extraCharges
}
```

**Updated price calculation** (line 145-150)
- Changed from: `eventsTotalPrice = cumulativeTotalPrice + eventBudget`
- Changed to: Calculate `extraServiceCharges` and `currentEventPrice = eventBudget + extraServiceCharges`

**Updated display** (line 431)
- Changed from: `{hideServicePrices && eventBudget ? eventBudget.toLocaleString() : totalPrice.toLocaleString()}`
- Changed to: `{currentEventPrice.toLocaleString()}`

**Updated handleNextStep()** (line 283-291)
- Changed from: passing only `totalPrice` (which was just service prices)
- Changed to: calculating `finalPrice = (eventBudget || 0) + calculateExtraServiceCharges()` for pre/post-wedding

### Step 2: Fix App.jsx Data Flow
**Updated handlePreWeddingServiceNext()** (line 179-187)
- Changed from: `totalPrice: preWeddingDurationPrice`
- Changed to: `totalPrice` (the parameter that includes duration + extra charges)

**Updated handlePostWeddingServiceNext()** (line 447-455)
- Changed from: `totalPrice: postWeddingDurationPrice`
- Changed to: `totalPrice` (the parameter that includes duration + extra charges)

## Result
Now the complete flow works correctly:

1. ✅ ServicesSelectionScreen displays correct budget with extra charges in real-time
2. ✅ When user clicks "NEXT STEP", the correct totalPrice (with extra charges) is passed
3. ✅ App.jsx stores this totalPrice in eventServicesMemory
4. ✅ QuoteSummary receives and displays the correct total
5. ✅ Extra charges are detailed in the "Extra Service Charges" section
6. ✅ Grand total reflects all events with their correct amounts

## Files Changed
1. `src/pages/QuotationBuilder/ServicesSelectionScreen.jsx`
   - Added `calculateExtraServiceCharges()` function
   - Updated `currentEventPrice` calculation
   - Updated price display logic
   - Updated `handleNextStep()` function

2. `src/App.jsx`
   - Fixed `handlePreWeddingServiceNext()` handler
   - Fixed `handlePostWeddingServiceNext()` handler

## Build Status
✅ No errors
✅ No warnings
✅ All 45 modules transformed successfully
