# Quantity Feature - User & Developer Guide

## Quick Start for Users

### How to Use Quantity Controls

#### For Photography Services (All 6 Services)
1. **Select a Service**: Click on any photography service card
   - Traditional Photo
   - Traditional Video
   - Candid Photo
   - Candid Video
   - Drone
   - Audience Video

2. **Adjust Quantity**: 
   - Quantity controls appear automatically below the selected service
   - Click **+** to increase quantity
   - Click **−** to decrease quantity (disabled when quantity = 1)

3. **See Price Update**:
   - Service price automatically updates based on quantity
   - Budget shows real-time total

#### For Albums
1. **Select Album Size**: Choose between 12×36 or 14×40
2. **Set Quantity**:
   - A "Select Number of Albums" section appears
   - Use +/− buttons to set how many albums you want
3. **Price Calculated**:
   - Album total = album price × quantity
   - Example: ₹40,000 × 2 albums = ₹80,000

### Budget Breakdown
The quote shows three budget levels:
- **Event Budget**: Total for individual event (service price × quantity)
- **Event Subtotals**: Each service line shows quantity badge (x1, x2, etc.)
- **Grand Total**: Sum of all events + albums with all quantities applied

---

## Quick Reference: Price Calculations

### Example Scenarios

#### Scenario 1: Multiple Services with Varying Quantities
```
Event: Wedding
- Traditional Photo (₹9,000) × 2 = ₹18,000
- Candid Video (₹16,000) × 1 = ₹16,000
- Drone (₹10,000) × 3 = ₹30,000
EVENT BUDGET = ₹64,000
```

#### Scenario 2: Album with Quantity
```
Album Selection:
- Size: 12×36 (Medium Large)
- Delivery: 1 Month (₹40,000)
- Quantity: 2

ALBUM BUDGET = ₹40,000 × 2 = ₹80,000
```

#### Scenario 3: Full Quote with Multiple Events
```
Wedding Services = ₹64,000 (from Scenario 1)
Engagement Services = ₹28,000
Pre-Wedding Package = ₹35,000
Albums = ₹80,000 (from Scenario 2)

GRAND TOTAL = ₹207,000
```

---

## Developer Implementation Details

### File Structure
```
src/pages/QuotationBuilder/
├── ServicesSelectionScreen.jsx        (Service quantity logic)
├── ServicesSelectionScreen.css        (Service quantity styling)
├── AlbumSize.jsx                      (Album quantity logic)
├── AlbumSize.css                      (Album quantity styling)
├── QuoteSummary.jsx                   (Display quantities & totals)
├── QuoteSummary.css                   (Quote styling)
└── App.jsx                            (Data flow & handlers)
```

### State Management in App.jsx

#### Data Structure: eventServicesMemory
```javascript
const eventServicesMemory = {
  'wedding': {
    services: ['traditional-photo', 'candid-video', 'drone'],
    totalPrice: 64000,
    quantities: {
      'traditional-photo': 2,
      'candid-video': 1,
      'drone': 3
    }
  },
  'album': {
    services: ['one-month'],
    totalPrice: 80000,
    sizeTitle: '12×36',
    sizeDescription: 'Medium Large',
    quantity: 2
  }
}
```

### Key Functions

#### ServicesSelectionScreen.jsx
```javascript
// Toggle service selection
const handleServiceToggle = (serviceId, price) => {
  // Adds/removes service, initializes quantity to 1
  // Updates totalPrice accordingly
}

// Adjust quantity for a service
const handleQuantityChange = (serviceId, price, change) => {
  const newQuantity = currentQuantity + change
  // Updates totalPrice: price × quantityDifference
  // Prevents quantity from going below 1
}

// Pass data to next screen
const handleNextStep = () => {
  onNext(services, totalPrice, serviceQuantities)
  // Passes quantities object to parent
}
```

#### AlbumSize.jsx
```javascript
// Adjust album quantity
const handleQuantityChange = (change) => {
  const newQuantity = quantity + change
  if (newQuantity >= 1) setQuantity(newQuantity)
}

// Pass data with quantity
const handleNextStep = () => {
  onNext(selectedSize, sizeTitle, sizeDescription, albumQuantity)
  // Fourth parameter: quantity
}
```

#### App.jsx Handlers
```javascript
// All service handlers now receive quantities
const handleServiceNext = (services, totalPrice, quantities) => {
  setEventServicesMemory(prev => ({
    ...prev,
    [selectedEvent]: { services, totalPrice, quantities }
  }))
}

// Album delivery calculates price with quantity
const handleAlbumDeliveryTimeNext = (deliveryId) => {
  const albumPrice = deliveryId === 'one-month' ? 40000 : 30000
  const albumQuantity = eventServicesMemory['album']?.quantity || 1
  // totalPrice = albumPrice × albumQuantity
}
```

#### QuoteSummary.jsx
```javascript
// Get quantity for a specific service
const getServiceQuantity = (event, serviceId) => {
  return event.quantities?.[serviceId] || 1
}

// Display service with quantity
<span className="quantity-badge">x{quantity}</span>
// Show recalculated price
₹ {(unitPrice × quantity).toLocaleString()}
```

### CSS Classes Reference

#### Service Quantity Controls
```css
.quantity-controls      /* Container for +/- buttons */
.qty-btn               /* Individual button styling */
.qty-btn.qty-minus     /* Minus button */
.qty-btn.qty-plus      /* Plus button */
.qty-value             /* Current quantity display */
```

#### Album Quantity Controls
```css
.quantity-section           /* Album quantity section */
.quantity-label            /* "Select Number of Albums" text */
.quantity-controls-album   /* Container for buttons */
.qty-btn-album             /* Album quantity buttons */
.qty-display               /* Album quantity display */
```

#### Quote Summary
```css
.quantity-badge    /* Quantity indicator in quote (x1, x2, etc.) */
.service-item      /* Service line item */
.service-info      /* Service name + quantity */
.service-price     /* Recalculated price with quantity */
```

---

## Testing Checklist

### Functionality Tests
- [ ] Select single service, verify quantity controls appear
- [ ] Increase quantity to 5, verify price updates correctly
- [ ] Decrease quantity back to 1
- [ ] Try to decrease below 1 (button should be disabled)
- [ ] Select multiple services with different quantities
- [ ] Go back and modify quantities, then proceed
- [ ] Verify cumulative budget includes all quantities

### Album Tests
- [ ] Select album size, verify quantity section appears
- [ ] Increase album quantity to 3
- [ ] Verify final price = base price × quantity
- [ ] Modify quantity, check quote reflects change

### Quote Summary Tests
- [ ] Verify quantity badges display (x1, x2, x3, etc.)
- [ ] Check expanded view shows recalculated prices
- [ ] Verify grand total includes all quantities
- [ ] Test with 0 albums (shouldn't show in quote)
- [ ] Test with maximum quantities

### Responsive Design Tests
- [ ] Desktop (1200px+): Full-size controls, clear layout
- [ ] Tablet (768px-1199px): Compact but readable
- [ ] Mobile (480px-767px): Stacked layout, touch-friendly
- [ ] Small Mobile (<480px): Minimal spacing, readable buttons

### Edge Cases
- [ ] Single service with quantity 1
- [ ] All services selected with high quantities
- [ ] Mix of events with varying quantities
- [ ] Navigate back and forward, verify quantities persist
- [ ] Maximum quantity (e.g., 10+ albums)

---

## Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes
- Quantity calculations are instant (no API calls)
- State updates trigger re-renders only for affected components
- Memory usage minimal (quantities stored as simple object)
- No optimization needed for typical use cases

---

## Future Enhancements
1. **Bulk Pricing**: Apply discounts for quantity >= 5
2. **Preset Packages**: "Popular Bundle" with predefined quantities
3. **Quantity Presets**: Save favorite quantity combinations
4. **Price Range Display**: Show min-max prices based on quantities
5. **Quantity Cart Icon**: Show total items in cart view
6. **Quantity Export**: Include quantities in PDF quotes

---

## Support & Troubleshooting

### Issue: Quantity controls don't appear
**Solution**: Ensure service is selected (checkbox visible)

### Issue: Price doesn't update
**Solution**: Check network/refresh page, verify quantity state

### Issue: Quantities not saved when going back
**Solution**: System saves in memory - if page refreshes, data resets

### Issue: Mobile buttons too small
**Solution**: Use device with 320px+ width for better UX
