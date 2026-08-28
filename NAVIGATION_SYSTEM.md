# Navigation System Documentation

## Overview

This document describes the new navigation system implemented for the Photographer Portal Quotation Builder. The system manages navigation flow through a multi-step process with proper forward and backward navigation.

## Navigation Flow

### Complete Step Sequence

The quotation builder follows this exact sequence of steps:

```
1.1 Event Selection (Wedding)
  ↓
1.2 Wedding Services
  ↓
2.1 Pre-Wedding Confirmation
  ↓
2.2 Pre-Wedding Duration
  ↓
2.3 Pre-Wedding Services
  ↓
3.1 Engagement Confirmation
  ↓
3.2 Engagement Services
  ↓
4.1 Groom Confirmation
  ↓
4.2 Groom Services
  ↓
5.1 Groom Haldi Confirmation
  ↓
5.2 Groom Haldi Services
  ↓
6.1 Bride Making Confirmation
  ↓
6.2 Bride Making Services
  ↓
7.1 Bride Haldi Confirmation
  ↓
7.2 Bride Haldi Services
  ↓
8.1 Reception Confirmation
  ↓
8.2 Reception Services
  ↓
9.1 Vratham Confirmation
  ↓
9.2 Vratham Services
  ↓
10.1 Sangeeth Confirmation
  ↓
10.2 Sangeeth Services
  ↓
11.1 Mehandi Confirmation
  ↓
11.2 Mehandi Services
  ↓
12.1 After Party Confirmation
  ↓
12.2 After Party Services
  ↓
13.1 Post Wedding Confirmation
  ↓
13.2 Post Wedding Duration
  ↓
13.3 Post Wedding Services
  ↓
14.1 Album Confirmation
  ↓
14.2 Album Size
  ↓
14.3 Album Delivery Time
  ↓
Quote Summary
```

## Implementation Details

### Core Components

#### 1. **Navigation History State**
```javascript
const [navigationHistory, setNavigationHistory] = useState([])
```
Maintains a stack of visited pages to enable proper back navigation in reverse order.

#### 2. **handleNavigateToNext() Function**
```javascript
const handleNavigateToNext = (nextPageId) => {
  if (currentPage !== 'landing') {
    setNavigationHistory([...navigationHistory, currentPage])
  }
  setCurrentPage(nextPageId)
}
```
- Records the current page in history before navigating
- Skips recording when coming from landing page
- Updates the current page

#### 3. **handleNavigateBack() Function**
```javascript
const handleNavigateBack = () => {
  if (navigationHistory.length === 0) {
    setCurrentPage('landing')
    return
  }
  
  const previousPage = navigationHistory[navigationHistory.length - 1]
  const newHistory = navigationHistory.slice(0, -1)
  setNavigationHistory(newHistory)
  setCurrentPage(previousPage)
}
```
- Pops the last visited page from history
- Returns to landing if no history exists
- Maintains the exact reverse order

#### 4. **handleConfirmationNext() Function**
```javascript
const handleConfirmationNext = (option, eventType) => {
  if (option === 'yes') {
    // Mark event as finalized
    const newFinalized = new Set(finalizedEvents)
    newFinalized.add(eventType)
    setFinalizedEvents(newFinalized)
    
    // Navigate to appropriate next page
    const nextPageMap = {
      'pre-wedding': 'pre-wedding-duration',
      'engagement': 'engagement-services',
      // ... more mappings
    }
    handleNavigateToNext(nextPageMap[eventType])
  } else {
    // Navigate to next event confirmation
    const nextEventMap = {
      'pre-wedding': 'engagement-confirmation',
      'engagement': 'groom-confirmation',
      // ... more mappings
    }
    handleNavigateToNext(nextEventMap[eventType])
  }
}
```
- Handles both YES and NO responses on confirmation screens
- Finalizes events when user says YES
- Routes to appropriate next screen based on response

### Event Handlers by Category

#### Service Selection Handlers
- `handleServiceNext()` - Wedding services
- `handlePreWeddingServiceNext()` - Pre-wedding services
- `handleEngagementServiceNext()` - Engagement services
- `handleGroomServiceNext()` - Groom services
- `handleGroomHaldiServiceNext()` - Groom Haldi services
- `handleBrideMakingServiceNext()` - Bride Making services
- `handleBrideHaldiServiceNext()` - Bride Haldi services
- `handleReceptionServiceNext()` - Reception services
- `handleVrathamServiceNext()` - Vratham services
- `handleSangeethServiceNext()` - Sangeeth services
- `handleMehandiServiceNext()` - Mehandi services
- `handleAfterPartyServiceNext()` - After Party services
- `handlePostWeddingServiceNext()` - Post Wedding services

Each handler:
1. Stores services and total price in `eventServicesMemory`
2. Calls `handleNavigateToNext()` with the next page ID

#### Duration Handlers
- `handlePreWeddingDurationNext()` - Pre-wedding duration selection
- `handlePostWeddingDurationNext()` - Post-wedding duration selection

These handlers:
1. Store the selected duration and price
2. Navigate to the corresponding services selection screen

#### Album Handlers
- `handleAlbumConfirmationNext()` - Album confirmation (YES/NO)
- `handleAlbumSizeNext()` - Album size selection
- `handleAlbumDeliveryTimeNext()` - Album delivery time selection

## How Back Navigation Works

When user clicks the back button on any screen:

1. **handleNavigateBack()** is called
2. The navigation history stack is checked
3. The last visited page is retrieved from the stack
4. Navigation history is updated (last item removed)
5. User is navigated to the previous page

### Example Backward Flow from Step 14.3

```
14.3 (Album Delivery Time) → Back
14.2 (Album Size) → Back
14.1 (Album Confirmation) → Back
13.3 (Post Wedding Services) → Back
13.2 (Post Wedding Duration) → Back
13.1 (Post Wedding Confirmation) → Back
12.2 (After Party Services) → Back
12.1 (After Party Confirmation) → Back
... and so on in complete reverse order
```

## State Management

### App State Variables

```javascript
// Navigation
const [currentPage, setCurrentPage] = useState('landing')
const [navigationHistory, setNavigationHistory] = useState([])

// Event Selection
const [selectedEvent, setSelectedEvent] = useState(null)

// Services & Pricing
const [selectedServices, setSelectedServices] = useState(null)
const [eventServicesMemory, setEventServicesMemory] = useState({})
const [finalizedEvents, setFinalizedEvents] = useState(new Set())

// Duration Options
const [preWeddingDuration, setPreWeddingDuration] = useState(null)
const [preWeddingDurationPrice, setPreWeddingDurationPrice] = useState(0)
const [postWeddingDuration, setPostWeddingDuration] = useState(null)
const [postWeddingDurationPrice, setPostWeddingDurationPrice] = useState(0)

// Album Options
const [albumDeliveryOption, setAlbumDeliveryOption] = useState(null)
```

### Helper Functions

```javascript
// Get selected event types
const getSelectedEventTypes = () => Object.keys(eventServicesMemory)

// Calculate cumulative total from finalized events
const calculateCumulativeTotal = () => {
  let total = 0
  finalizedEvents.forEach(eventType => {
    if (eventServicesMemory[eventType]) {
      total += eventServicesMemory[eventType].totalPrice || 0
    }
  })
  return total
}
```

## Using the Navigation System

### For Next Navigation
```javascript
// In any screen component
<button onClick={() => onNext(data)}>Next Step</button>

// The parent (App.jsx) handler then:
const handleServiceNext = (services, totalPrice) => {
  // Store data
  setEventServicesMemory({ ... })
  // Navigate to next page
  handleNavigateToNext('next-page-id')
}
```

### For Back Navigation
```javascript
// In any screen component
<button onClick={onBack}>← Back</button>

// The parent (App.jsx) automatically calls:
handleNavigateBack()
```

## File Structure

```
src/
├── App.jsx                          # Main app with navigation logic
├── utils/
│   └── navigationFlow.js            # Navigation utilities (for future use)
└── pages/QuotationBuilder/
    ├── EventSelection.jsx           # Step 1.1
    ├── ServicesSelectionScreen.jsx  # Steps 1.2, 2.3, 3.2, etc.
    ├── EventConfirmation.jsx        # Steps 2.1, 3.1, 4.1, etc.
    ├── PreWeddingDuration.jsx       # Step 2.2
    ├── PostWeddingDuration.jsx      # Step 13.2
    ├── AlbumSize.jsx                # Step 14.2
    ├── AlbumDeliveryTime.jsx        # Step 14.3
    └── QuoteSummary.jsx             # Final summary
```

## Testing Navigation

### Test Case 1: Forward Navigation
1. Start at landing page
2. Click "GET STARTED"
3. Select "Wedding" event
4. Select services
5. Continue through all steps
6. Should reach Quote Summary

### Test Case 2: Backward Navigation from Middle
1. Complete steps 1.1 to 5.2
2. Click back button at step 5.2
3. Should go to 5.1 → 4.2 → 4.1 → 3.2 → 3.1 → 2.3 → 2.2 → 2.1 → 1.2 → 1.1 → landing

### Test Case 3: YES/NO Branching
1. At pre-wedding confirmation (2.1)
2. Click "No"
3. Should skip pre-wedding-duration and pre-wedding-services
4. Should go directly to engagement-confirmation (3.1)

### Test Case 4: Album Skipping
1. At album confirmation (14.1)
2. Click "No"
3. Should skip album-size and delivery-time
4. Should go directly to quote-summary

## Future Enhancements

1. **Persistent Navigation History**: Store history in sessionStorage for page refresh resilience
2. **Breadcrumb Navigation**: Show current position in flow
3. **Skip Validation**: Add validation before allowing forward navigation
4. **Analytics**: Track user navigation patterns
5. **Dynamic Step Counting**: Calculate progress percentage

## Troubleshooting

### Issue: Back button not working correctly
**Solution**: Check that `navigationHistory` is being properly maintained. Verify all `handleNavigateToNext()` calls are updating history correctly.

### Issue: Getting stuck on a page
**Solution**: Ensure the page component is calling `onNext()` handler with correct parameters. Check that the next page ID matches exactly.

### Issue: Navigation history growing too large
**Solution**: This should not happen in normal usage as history only goes back one page at a time. If issue persists, check for navigation loops.

## Code Quality

- All navigation state is centralized in `App.jsx`
- Handlers are organized by category with clear comments
- Navigation functions are pure and follow React best practices
- State updates are immutable (using spread operator and new Set())
- Page rendering uses simple if statements for clarity

## References

- Navigation Flow Utilities: `src/utils/navigationFlow.js`
- Main App Logic: `src/App.jsx`
- Component Documentation: See individual component files
