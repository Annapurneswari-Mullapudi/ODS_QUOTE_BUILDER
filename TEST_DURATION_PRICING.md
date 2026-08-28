# Testing Duration-Based Pricing

## Test Checklist

### Test 1: Pre-Wedding Duration Pricing ✅

**Scenario**: Select pre-wedding with duration-based pricing

```
Step 1.1: Select "Wedding"
  ✓ Continue

Step 1.2: Select Wedding Services
  ✓ Select: Traditional Photo (₹9,000) + Candid Video (₹16,000)
  ✓ Budget shown: ₹25,000
  ✓ Total budget: ₹25,000
  ✓ Click NEXT STEP

Step 2.1: Pre-Wedding Confirmation
  ✓ Answer: YES
  ✓ Total budget: ₹25,000 (unchanged)
  ✓ Click NEXT STEP

Step 2.2: Pre-Wedding Duration ⭐ CRITICAL TEST
  ✓ Select: "6-hours" (₹30,000)
  ✓ Budget shown: ₹30,000
  ✓ Total budget: ₹55,000 ✓ (25,000 + 30,000)
  ✓ Click NEXT STEP

Step 2.3: Pre-Wedding Services 🚫 CRITICAL TEST
  ✓ Services shown WITHOUT prices (no ₹ amounts)
  ✓ Select: Candid Photo + Drone
  ✓ Budget shown: ₹30,000 (duration price, NOT 22,000)
  ✓ Total budget: ₹55,000 ✓ (NO CHANGE - important!)
  ✓ Click NEXT STEP

Step 3.1+: Continue through remaining events
  ✓ Each event's total should accumulate correctly
  ✓ Final total should include ₹30,000 for pre-wedding (exactly once)

Final Quote Summary:
  ✓ Pre-Wedding shown with services: Candid Photo, Drone
  ✓ Pre-Wedding price: ₹30,000 ✓ (Duration price)
  ✓ Total includes: ₹25,000 + ₹30,000 + other events
```

**Expected Result**: ✅ Pre-wedding duration price added exactly once, not duplicated

---

### Test 2: Post-Wedding Duration Pricing ✅

**Scenario**: Select post-wedding with duration-based pricing

```
Step 13.1: Post-Wedding Confirmation
  ✓ Answer: YES
  ✓ Current total: (sum of all previous)
  ✓ Click NEXT STEP

Step 13.2: Post-Wedding Duration ⭐ CRITICAL TEST
  ✓ Select: "2-days" (₹40,000)
  ✓ Budget shown: ₹40,000
  ✓ Total budget: Previous + ₹40,000
  ✓ Click NEXT STEP

Step 13.3: Post-Wedding Services 🚫 CRITICAL TEST
  ✓ Services shown WITHOUT prices (no ₹ amounts)
  ✓ Select: Candid Photo + Candid Video
  ✓ Budget shown: ₹40,000 (duration price, NOT 28,000)
  ✓ Total budget: (NO CHANGE from 13.2)
  ✓ Click NEXT STEP

Step 14.1+: Continue to album
  
Final Quote Summary:
  ✓ Post-Wedding shown with services: Candid Photo, Candid Video
  ✓ Post-Wedding price: ₹40,000 ✓ (Duration price)
  ✓ Total includes: ... + ₹40,000 (exact amount)
```

**Expected Result**: ✅ Post-wedding duration price added exactly once, not duplicated

---

### Test 3: Changing Duration (Back Navigation) ✅

**Scenario**: User goes back and changes duration

```
At Step 2.3 (with 6-hours = ₹30,000):
  Current Total: ₹55,000

Go BACK to Step 2.2:
  ✓ Total back to: ₹25,000 (pre-wedding removed from view)
  
Change to "Full-day" (₹45,000):
  ✓ Budget shown: ₹45,000
  ✓ Total budget: ₹70,000 ✓ (25,000 + 45,000)
  
Go NEXT to Step 2.3:
  ✓ Services should be remembered (if saved before)
  ✓ Budget shown: ₹45,000 ✓ (Updated to new duration)
  ✓ Total budget: ₹70,000 ✓ (Matches Step 2.2)
  
Continue to Final Quote:
  ✓ Pre-Wedding price: ₹45,000 ✓ (Full-day, not 6-hours)
  ✓ Total: Updated with ₹45,000 (not ₹30,000)
```

**Expected Result**: ✅ Duration price updates correctly when changed

---

### Test 4: Skipping Duration Events ✅

**Scenario**: User selects NO for pre-wedding/post-wedding

```
Step 2.1: Pre-Wedding Confirmation
  ✓ Answer: NO
  ✓ Skip to Step 3.1 (Engagement)
  ✓ Total budget: ₹25,000 (no pre-wedding added)
  
Final Quote:
  ✓ Pre-Wedding NOT in quote
  ✓ Total: ₹25,000 + other events (no ₹30,000)
```

**Expected Result**: ✅ No price added when event skipped

---

### Test 5: Complete Flow ✅

**Full wedding with both pre and post-wedding**

```
Expected Budget Breakdown:
├─ Wedding services: ₹25,000
├─ Pre-Wedding duration (6h): ₹30,000 ⭐
├─ Engagement services: ₹23,000
├─ Groom services: ₹28,000
├─ Groom Haldi services: ₹20,000
├─ Bride Making services: ₹28,000
├─ Bride Haldi services: ₹20,000
├─ Reception services: ₹37,000
├─ Vratham services: ₹23,000
├─ Sangeeth services: ₹28,000
├─ Mehandi services: ₹28,000
├─ After-Party services: ₹37,000
├─ Post-Wedding duration (2d): ₹40,000 ⭐
└─ Album: ₹40,000

Running Total:
1.2: ₹25,000
2.2: ₹55,000 (+ ₹30,000 duration)
2.3: ₹55,000 (no change)
3.2: ₹78,000
4.2: ₹106,000
5.2: ₹126,000
6.2: ₹154,000
7.2: ₹174,000
8.2: ₹211,000
9.2: ₹234,000
10.2: ₹262,000
11.2: ₹290,000
12.2: ₹327,000
13.2: ₹367,000 (+ ₹40,000 duration)
13.3: ₹367,000 (no change)
14.3: ₹407,000 (+ ₹40,000 album)

Final Total: ₹407,000 ✓
```

**Expected Result**: ✅ All prices added correctly, no duplication

---

### Test 6: Back/Forward Multiple Times ✅

**Scenario**: Navigate back and forward multiple times

```
Forward to 2.3 (total ₹55,000):
  ✓ Budget correct

Back to 2.2:
  ✓ Duration shown: 6-hours (₹30,000)
  ✓ Can select different duration

Forward to 2.3 again:
  ✓ Budget updated if changed
  ✓ Services remembered (if saved)
  
Back to 2.1 → Back to 1.2 → Forward to 2.1 → Forward to 2.2 → Forward to 2.3:
  ✓ Final total: Correct and consistent
```

**Expected Result**: ✅ Budget persists and updates correctly through multiple navigation cycles

---

## What to Verify in Each Test

### ✅ At Step 2.2 (Pre-Wedding Duration)
- [ ] Duration options shown with prices (3h, 6h, full-day)
- [ ] Budget shown updates when duration selected
- [ ] Total budget includes duration price

### ✅ At Step 2.3 (Pre-Wedding Services)
- [ ] NO prices shown for individual services (Candid Photo, Drone, etc.)
- [ ] Budget shown equals duration price (₹30,000, not service total)
- [ ] Total budget UNCHANGED from Step 2.2
- [ ] Services can be selected/deselected without affecting budget

### ✅ At Final Quote
- [ ] Pre-Wedding shows: Services listed + Duration price (₹30,000)
- [ ] Post-Wedding shows: Services listed + Duration price (₹40,000)
- [ ] Total includes each duration price exactly once
- [ ] No duplication of prices

---

## Debug Commands

If something goes wrong, check in browser console:

```javascript
// Check event services memory
console.log('Memory:', eventServicesMemory)

// Expected at Step 2.3:
{
  'wedding': { services: [...], totalPrice: 25000 },
  'pre-wedding': { services: ['candid-photo', 'drone'], totalPrice: 30000 }
  // ⭐ totalPrice should be 30000 (duration), not service sum!
}

// Check duration prices stored
console.log('Pre-Wedding Duration Price:', preWeddingDurationPrice)
console.log('Post-Wedding Duration Price:', postWeddingDurationPrice)

// Check calculated total
console.log('Total Budget:', calculateCumulativeTotal())
```

---

## Common Issues & Solutions

### Issue: Pre-wedding price showing ₹0 at final quote
**Solution**: Check that duration was selected at Step 2.2. Duration must be selected before services.

### Issue: Pre-wedding services showing individual prices at Step 2.3
**Solution**: Verify `hideServicePrices={true}` is passed to ServicesSelectionScreen at pre-wedding step. Prices should be hidden.

### Issue: Total increasing at Step 2.3
**Solution**: This is WRONG. Step 2.3 should NOT add prices. Verify handler stores `preWeddingDurationPrice` not `totalPrice`.

### Issue: Budget showing service total instead of duration price
**Solution**: Check that `eventBudget` prop is being passed correctly to ServicesSelectionScreen.

### Issue: Duration price not persisting to final quote
**Solution**: Verify that `eventServicesMemory['pre-wedding']` has `totalPrice: preWeddingDurationPrice` (not service prices).

---

## Sign-Off Checklist

Run all tests and verify:

- [ ] Test 1: Pre-Wedding Duration Pricing - ✅ PASS
- [ ] Test 2: Post-Wedding Duration Pricing - ✅ PASS
- [ ] Test 3: Changing Duration (Back Navigation) - ✅ PASS
- [ ] Test 4: Skipping Duration Events - ✅ PASS
- [ ] Test 5: Complete Flow - ✅ PASS
- [ ] Test 6: Back/Forward Multiple Times - ✅ PASS

All tests passing: **✅ READY FOR DEPLOYMENT**

---

**Version**: 1.0  
**Date**: 2026-08-24  
**Status**: Ready for Testing
