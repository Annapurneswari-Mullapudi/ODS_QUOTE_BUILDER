# Quick Test: Extra Service Charges Flow

## Test Scenario: Pre-Wedding 1-Day + Extra Services

### Setup
1. Start: "GET STARTED" → Event Selection
2. Select: Wedding → Yes → Services (default)
3. Continue through events until reaching Pre-Wedding
4. Pre-Wedding: Choose 1 Day (₹20,000)

### In Pre-Wedding Services Screen
**You should see:**
- 3 services selected: Candid Photo, Candid Video, Drone (all qty = 1)
- "Budget of this event" shows: **₹20,000** (duration price only)
- "Total budget" shows: previous events + ₹20,000

### Increase Quantities
**Click + on Candid Photo (Qty: 1 → 2)**
- Extra charge: (2-1) × ₹8,000 = ₹8,000
- "Budget of this event" should update to: **₹28,000** ✅
- "Total budget" should update accordingly ✅

**Click + on Candid Video (Qty: 1 → 2)**
- Extra charge: (2-1) × ₹10,000 = ₹10,000
- "Budget of this event" should update to: **₹38,000** ✅ (₹20,000 + ₹8,000 + ₹10,000)

**Click + on Drone (Qty: 1 → 3)**
- Extra charge: (3-1) × ₹8,000 = ₹16,000
- "Budget of this event" should update to: **₹54,000** ✅ (₹20,000 + ₹8,000 + ₹10,000 + ₹16,000)

### After Clicking "NEXT STEP"
**In QuoteSummary, for Pre-Wedding event, you should see:**
- Event Title: "The Pre-Wedding"
- Services Table:
  * Candid Photo: ₹8,000 × 2 = ₹16,000
  * Candid Video: ₹10,000 × 2 = ₹20,000
  * Drone: ₹8,000 × 3 = ₹24,000
- "Extra Service Charges" section:
  * "+ Candid Photo: (2-1) × ₹8,000 = ₹8,000"
  * "+ Candid Video: (2-1) × ₹10,000 = ₹10,000"
  * "+ Drone: (3-1) × ₹8,000 = ₹16,000"
- Event Total: **₹54,000** ✅
- Grand Total (if other events): Previous + ₹54,000 ✅

## Expected Results
✅ ServicesSelectionScreen budget updates in real-time with extra charges
✅ QuoteSummary shows correct total including extra charges
✅ Extra charges clearly displayed in detail section
✅ Grand total reflects all events correctly

## What Would Be Wrong
❌ If ServicesSelectionScreen still shows ₹20,000 after adding extra services
❌ If QuoteSummary shows ₹20,000 instead of ₹54,000
❌ If extra charges section is missing or shows wrong amounts
❌ If grand total doesn't include the extra charges
