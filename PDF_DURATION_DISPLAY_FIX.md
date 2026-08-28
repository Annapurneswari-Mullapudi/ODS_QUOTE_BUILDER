# PDF Duration Display Fix - Pre-Wedding/Post-Wedding

## Problem
The PDF was not showing the duration information separately, making it unclear to clients how the total price was calculated (duration cost + extra service charges).

## Solution
Added a duration row at the top of the services table for pre-wedding/post-wedding events that shows:
1. Duration name (1 Day or 2 Days)
2. Duration unit price as "-" 
3. Duration quantity as "-"
4. **Duration price in the Total column**

Plus showing "-" in both Unit Price and Total columns for services.

## How It Works Now

### Pre-Wedding/Post-Wedding PDF Table

**For Pre-Wedding 1-Day (₹20,000) with service increases:**

```
The Pre-Wedding

Item                 | Unit Price | Qty | Total
─────────────────────────────────────────────────
Duration: 1 Day      |     -      | -   | Rs. 20,000  ← NEW!
Candid Photo         |     -      | 2   | -
Candid Video         |     -      | 3   | -
Drone                |     -      | 1   | -

Extra Service Charges:
+ Candid Photo: (1) × Rs. 8,000 = Rs. 8,000
+ Candid Video: (2) × Rs. 10,000 = Rs. 20,000

Event Total: Rs. 48,000
```

**Client can now see:**
- Duration (1 Day) = Rs. 20,000
- Services included in duration = Candid Photo, Candid Video, Drone (qty 1 each)
- Extra services charged = Candid Photo +1, Candid Video +2
- Extra service cost = Rs. 8,000 + Rs. 20,000 = Rs. 28,000
- **Total = Rs. 20,000 + Rs. 28,000 = Rs. 48,000** ✅

## Changes Made

### In QuoteSummary.jsx (both PDF functions)

1. **Added Duration Detection Logic:**
   - Calculates base duration price by subtracting extra charges from event total
   - Determines if it's 1-Day (₹20,000) or 2-Days (₹40,000)
   - Formula: `durationPrice = totalPrice - extraChargesTotal`

2. **Added Duration Row:**
   - Displays before service table
   - Format: `Duration: {1 Day|2 Days}` in Item column
   - Shows "-" in Unit Price column
   - Shows "-" in Qty column
   - Shows actual duration price in Total column

3. **Updated Services Display:**
   - Changed from showing actual unit price to showing "-"
   - Changed from showing total price to showing "-"
   - Makes it clear these are package-included services, not separately charged

## Structure Before vs After

### BEFORE:
```
Item                 | Unit Price    | Qty | Total
Candid Photo         | Rs. 8,000     | 2   | -
Candid Video         | Rs. 10,000    | 3   | -
Drone                | Rs. 8,000     | 1   | -
```
❌ Client might think: Where's the base cost? Why are services showing with dashes?

### AFTER:
```
Item                 | Unit Price | Qty | Total
Duration: 1 Day      |     -      | -   | Rs. 20,000
Candid Photo         |     -      | 2   | -
Candid Video         |     -      | 3   | -
Drone                |     -      | 1   | -
```
✅ Client can clearly see: Base cost is ₹20,000 for the duration, services are included

## Files Modified
- `src/pages/QuotationBuilder/QuoteSummary.jsx`
  - First PDF function (download): Added duration row and logic
  - Second PDF function (share): Added duration row and logic

## Testing Checklist
✅ Build completes successfully  
✅ Pre-wedding 1-day shows "Duration: 1 Day" with ₹20,000  
✅ Pre-wedding 2-day shows "Duration: 2 Days" with ₹40,000  
✅ Post-wedding 1-day shows "Duration: 1 Day" with ₹20,000  
✅ Post-wedding 2-day shows "Duration: 2 Days" with ₹40,000  
✅ Services show "-" in both Unit Price and Total columns  
✅ Extra Service Charges section displays correctly  
✅ Other events (wedding, engagement, etc.) unchanged  
✅ Download PDF works correctly  
✅ Share to WhatsApp PDF works correctly  

## Result
Clients can now easily understand the breakdown:
- Duration cost is clearly shown as a line item
- Services included in duration are marked with "-"
- Extra services are separated with full breakdown
- Total calculation is transparent and easy to verify
