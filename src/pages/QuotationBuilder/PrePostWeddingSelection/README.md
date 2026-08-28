# Pre-Wedding/Post-Wedding Selection Module

## Overview
This module handles the selection between pre-wedding and post-wedding photography shoots. When a user clicks on the "Pre-Wedding/Post-Wedding" card on the EventSelection screen, they are presented with two distinct options to choose from.

## Files

### PrePostWeddingSelection.jsx
Main component that displays two selection containers for:
- **Pre-Wedding**: Captures the joy and excitement before the big day
- **Post-Wedding**: Cherish the moments after your celebration

### PrePostWeddingSelection.css
Styling for the selection screen with:
- Responsive grid layout
- Card-based UI matching the EventSelection design
- Hover effects and selection states
- Mobile-friendly design

### index.js
Module export for clean imports

## Component Props

```javascript
{
  onBack: Function,      // Callback when back button is clicked
  onNext: Function       // Callback when a selection is made
}
```

## How It Works

1. User clicks on the "Pre-Wedding/Post-Wedding" card on EventSelection
2. `EventSelection.jsx` calls `handleEventClick('pre-wedding')`
3. This navigates to the PrePostWeddingSelection page (STEP 1.2)
4. User selects either:
   - `'pre-wedding'` - For pre-wedding shoot
   - `'post-wedding'` - For post-wedding shoot
5. The selected value is passed to `onNext()` callback
6. App.jsx sets `selectedEvent` to the chosen value
7. Flow continues to service selection

## Integration with App.jsx

### Navigation Handler
```javascript
if (currentPage === 'pre-post-wedding') {
  return (
    <PrePostWeddingSelection 
      onBack={handleNavigateBack} 
      onNext={(option) => {
        setSelectedEvent(option)
        handleNavigateToNext('service-selection')
      }}
    />
  )
}
```

### Event Selection Handler
In EventSelection.jsx:
```javascript
const handleEventClick = (eventId) => {
  if (eventId === 'pre-wedding') {
    onNext('pre-post-wedding')  // Navigate to pre/post selection
  } else {
    setSelectedEventType(eventId)
  }
}
```

## Data Flow

```
EventSelection
    ↓
    (user clicks Pre-Wedding/Post-Wedding card)
    ↓
PrePostWeddingSelection (STEP 1.2)
    ↓
    (user selects pre-wedding or post-wedding)
    ↓
ServicesSelectionScreen (STEP 1.3)
    ↓
    (services for selected type)
```

## Key Differences from Other Events

- **Two-step selection**: Pre-Wedding/Post-Wedding requires an additional selection step
- **Special duration handling**: Both pre-wedding and post-wedding have duration-based pricing
  - Pre-wedding duration selected before services
  - Post-wedding duration selected before services
- **Different confirmation screens**: Each shows appropriate confirmation message

## Styling Features

- **Golden gradient**: Uses the app's primary color scheme (#d4af37, #f5d76e)
- **Card-based layout**: Two containers side-by-side on desktop, stacked on mobile
- **Selection indicator**: Checkmark appears when a card is selected
- **Hover effects**: Cards lift and show golden border on hover
- **Responsive**: Automatically adjusts for mobile, tablet, and desktop

## Future Enhancements

- Add image previews for pre-wedding vs post-wedding photography styles
- Include pricing preview for each type
- Add more detailed descriptions with examples
- Include gallery preview of past shoots

## Related Components

- `EventSelection.jsx` - Parent component
- `PreWeddingDuration.jsx` - Pre-wedding specific duration selection
- `PostWeddingDuration.jsx` - Post-wedding specific duration selection
- `ServicesSelectionScreen.jsx` - Service selection (used after this choice)
- `EventConfirmation.jsx` - Confirmation screen for both types
