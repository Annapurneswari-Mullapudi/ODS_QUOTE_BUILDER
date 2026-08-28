# PDF Layout Example - Before and After

## Scenario
Pre-Wedding 1-Day (₹20,000 base) with:
- Candid Photo increased to qty 2 (extra: +1 × ₹8,000)
- Candid Video increased to qty 3 (extra: +2 × ₹10,000)
- Drone at qty 1 (no extra)

---

## BEFORE (Confusing)
```
The Pre-Wedding
Generated: 27/08/2026

Item                    Unit Price    Qty    Total
────────────────────────────────────────────────
Candid Photo            Rs. 8,000     2      -
Candid Video            Rs. 10,000    3      -
Drone                   Rs. 8,000     1      -

Extra Service Charges:
+ Candid Photo: (1) × Rs. 8,000 = Rs. 8,000
+ Candid Video: (2) × Rs. 10,000 = Rs. 20,000

Event Total: Rs. 48,000
```

❌ **Problems:**
- Where's the ₹20,000 base cost?
- Why are unit prices shown but totals are "-"?
- Client unsure if ₹48,000 is correct

---

## AFTER (Clear)
```
The Pre-Wedding
Generated: 27/08/2026

Item                    Unit Price    Qty    Total
────────────────────────────────────────────────
Duration: 1 Day              -        -      Rs. 20,000 ← NEW!
Candid Photo                 -        2      -
Candid Video                 -        3      -
Drone                        -        1      -

Extra Service Charges:
+ Candid Photo: (1) × Rs. 8,000 = Rs. 8,000
+ Candid Video: (2) × Rs. 10,000 = Rs. 20,000

Event Total: Rs. 48,000
```

✅ **Benefits:**
- Clearly shows ₹20,000 is the duration cost
- Services show "-" indicating included in duration
- Extra charges add up: ₹8,000 + ₹20,000 = ₹28,000
- Total = ₹20,000 (duration) + ₹28,000 (extras) = ₹48,000
- **Client can verify and understand the calculation**

---

## Breakdown Visibility

### BEFORE:
Client sees: Event Total ₹48,000
- Duration? Unknown
- Service charges? Unclear
- Extra charges? Only shown below, hard to connect to total

### AFTER:
Client sees: Event Total ₹48,000
```
  = Duration (1 Day)
    ₹20,000
  
  + Extra Services
    ₹8,000 (Candid Photo +1)
    ₹20,000 (Candid Video +2)
    ─────────
    ₹28,000
  ─────────
  ₹48,000 ✓
```

Client can now **easily verify** the total with transparent breakdown.

---

## Other Event Comparison

### Wedding Event (Unchanged)
```
The Wedding Ceremony
Generated: 27/08/2026

Item                    Unit Price    Qty    Total
────────────────────────────────────────────────
Traditional Photo       Rs. 5,000     2      Rs. 10,000
Traditional Video       Rs. 5,000     1      Rs. 5,000
Candid Photo            Rs. 8,000     2      Rs. 16,000
Candid Video            Rs. 10,000    1      Rs. 10,000

Event Total: Rs. 41,000
```

✅ For non-pre/post-wedding events:
- Unit prices shown normally
- Total calculated as Unit Price × Qty
- No duration line (not applicable)
- Works as expected

---

## Key Visual Differences

| Element | Before | After |
|---------|--------|-------|
| Duration row | ❌ Not shown | ✅ Shown as first line |
| Duration price | ❌ Hidden in total | ✅ Explicitly shown |
| Service unit prices | ❌ Shown in total | ✅ Shows "-" (included) |
| Service totals | ✅ Shows "-" | ✅ Shows "-" (included) |
| Clarity | ❌ Confusing | ✅ Crystal clear |
| Calculation | ❌ Hard to verify | ✅ Easy to verify |

---

## How Client Uses This

1. **Sees Event Total: Rs. 48,000**
2. **Looks at Duration row**: "Ah, so 1 Day costs Rs. 20,000"
3. **Sees services with "-"**: "These are included in the duration"
4. **Looks at Extra Service Charges**: 
   - Candid Photo +1 = Rs. 8,000
   - Candid Video +2 = Rs. 20,000
5. **Verifies**: 20,000 + 8,000 + 20,000 = 48,000 ✓
6. **Satisfied**: "I understand exactly what I'm paying for"

---

## Implementation Success Criteria
✅ Duration shown as line item  
✅ Duration price visible  
✅ Services marked with "-" (included in package)  
✅ Extra charges clearly separated  
✅ Total is verifiable by client  
✅ Professional, clean format  
✅ No confusion about pricing  
