# PDF Display Fix: Pre-Wedding/Post-Wedding Services

## Problem
The PDF was showing individual service prices as if they were each being charged separately, even though for pre-wedding/post-wedding events, the services are included in the duration package price.

**Example:**
- Pre-Wedding 1-Day package includes: Candid Photo, Candid Video, Drone (qty 1 each)
- If user increases any quantity, only the extra quantity should be charged
- But the PDF was showing: 
  * Candid Photo: Rs. 8,000 × 1 = Rs. 8,000 ❌
  * Candid Video: Rs. 10,000 × 3 = Rs. 30,000 ❌
  * (showing individual price × qty as if each is being charged)

## Solution
Modified both PDF generation functions in `QuoteSummary.jsx` to:

1. **Show "-" in Total column for qty=1**: When quantity is 1, the service is included in the duration package, so no extra charge is shown
2. **Show extra charges separately for qty>1**: When quantity > 1, show "-" in the table but add a separate "Extra Service Charges" section below the services that shows:
   - Service name with extra quantity and unit price
   - Total extra charge for that service

## How It Works Now

### For Pre-Wedding/Post-Wedding Events:

**Example Setup:**
- Pre-Wedding 1-Day: ₹20,000 (includes 1× each of Candid Photo, Candid Video, Drone)
- User increases: Candid Photo (1→2), Candid Video (1→3), Drone (1→1)

**PDF Table Now Shows:**
| Item | Unit Price | Qty | Total |
|------|------------|-----|-------|
| Candid Photo | Rs. 8,000 | 2 | **-** |
| Candid Video | Rs. 10,000 | 3 | **-** |
| Drone | Rs. 8,000 | 1 | **-** |

**Extra Service Charges Section:**
```
Extra Service Charges:
+ Candid Photo: (1) × Rs. 8,000 = Rs. 8,000
+ Candid Video: (2) × Rs. 10,000 = Rs. 20,000
```

**Event Total: Rs. 48,000**
(₹20,000 base + ₹8,000 + ₹20,000 extra charges)

### For Other Events:
- Total column shows the actual price (unitPrice × quantity)
- No "Extra Service Charges" section
- Works as before

## Implementation Details

### Modified Sections in QuoteSummary.jsx

Both PDF generation functions have been updated:
1. First function (~lines 340-430)
2. Second function (~lines 700-800)

Both functions now:
- Check if event is `pre-wedding` or `post-wedding`
- Show "-" in Total column if `isPreOrPostWedding`
- Show normal price calculation if not pre/post-wedding
- After services table, if `isPreOrPostWedding`:
  - Call `getExtraServiceChargeDetails(event)`
  - If extra charges exist, render "Extra Service Charges:" section
  - Format: `+ ServiceName: (extraQty) × Rs. unitPrice = Rs. totalExtra`

## Files Modified
- `src/pages/QuotationBuilder/QuoteSummary.jsx`
  - Updated both PDF download and PDF share functions
  - Modified service table rendering logic for pre/post-wedding events
  - Added extra charges section rendering

## Testing Checklist
✅ Build completes successfully  
✅ PDF for pre-wedding with qty=1: shows "-" in total  
✅ PDF for pre-wedding with qty>1: shows "-" in total + extra charges section  
✅ PDF for other events: shows normal price calculation  
✅ Extra charges section displays correct format  
✅ Download PDF button works with new format  
✅ Share to WhatsApp button works with new format  

## Result
Users now see clear, accurate pricing in the PDF that properly reflects:
- What's included in the duration package (shown with "-")
- What's extra and being charged (shown in separate section)
- No confusion about individual service pricing vs. package pricing
