# Pre-Wedding/Post-Wedding Selection Flow Implementation

## Summary
Implemented a two-step selection flow for Pre-Wedding/Post-Wedding photography:
1. User clicks on "Pre-Wedding/Post-Wedding" card in EventSelection
2. New PrePostWeddingSelection screen appears with two container options
3. User selects either pre-wedding or post-wedding
4. Flow continues to duration selection and services

## Changes Made

### 1. New Component: PrePostWeddingSelection
- **Location**: `src/pages/QuotationBuilder/PrePostWeddingSelection/`
- **Files**:
  - `PrePostWeddingSelection.jsx` - Main component
  - `PrePostWeddingSelection.css` - Styling
  - `index.js` - Module export
  - `README.md` - Documentation

**Features**:
- Two side-by-side card containers (responsive)
- Beautiful UI matching EventSelection design
- Selection state with checkmark indicator
- Hover effects and smooth transitions
- Mobile-friendly responsive design

### 2. Updated EventSelection.jsx
- Added `handleEventClick()` function to intercept "pre-wedding" card click
- When pre-wedding card is clicked, navigates to `'pre-post-wedding'` page
- Other event cards proceed directly to service selection as before

**Key Change**:
```javascript
const handleEventClick = (eventId) => {
  if (eventId === 'pre-wedding') {
    onNext('pre-post-wedding')  // Go to pre/post selection
  } else {
    setSelectedEventType(eventId)
  }
}
```

### 3. Updated App.jsx
- Imported PrePostWeddingSelection component
- Added new route condition for `'pre-post-wedding'` page
- Sets `selectedEvent` to chosen value (pre-wedding or post-wedding)
- Routes to `'service-selection'` after choice

**New Route Logic**:
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

### 4. Folder Structure
Created organized folder structure for future scalability:
- `PrePostWeddingSelection/` - Pre/post wedding choice
- `Wedding/` - Wedding event (placeholder)
- `Engagement/` - Engagement event (placeholder)
- `OtherEvents/` - Birthday, Maternity, etc. (placeholder)

Created documentation:
- `FOLDER_STRUCTURE_GUIDE.md` - Complete folder organization guide
- `PRE_POST_WEDDING_IMPLEMENTATION.md` - This file

## User Flow Diagram

```
┌─────────────────────────────────┐
│   EventSelection (STEP 1.1)     │
│  - Wedding                      │
│  - Pre-Wedding/Post-Wedding ← ← ←┐
│  - Engagement                    │
│  - Birthday                      │
│  - Maternity                     │
│  - Other Events                  │
└─────────────────────────────────┘
                                   │
                    ┌──────────────┘
                    ↓
        ┌─────────────────────────────────┐
        │ PrePostWeddingSelection (1.2)   │
        │                                 │
        │  ┌──────────────┐ ┌──────────────┐
        │  │ Pre-Wedding  │ │ Post-Wedding │
        │  │              │ │              │
        │  │   📸         │ │     💕       │
        │  │              │ │              │
        │  └──────────────┘ └──────────────┘
        │                                 │
        └─────────────────────────────────┘
                    │ (selected)
                    ↓
        ┌─────────────────────────────────┐
        │ Duration Selection              │
        │ (Pre/PostWeddingDuration)       │
        │ - 4 Hours                       │
        │ - 6 Hours                       │
        │ - 8 Hours                       │
        │ - Full Day                      │
        └─────────────────────────────────┘
                    │
                    ↓
        ┌─────────────────────────────────┐
        │ Service Selection               │
        │ (ServicesSelectionScreen)       │
        │ - Traditional Photo             │
        │ - Candid Photo                  │
        │ - Drone                         │
        │ etc.                            │
        └─────────────────────────────────┘
                    │
                    ↓
        ┌─────────────────────────────────┐
        │ Confirmation                    │
        │ (EventConfirmation)             │
        │ - Yes (continue to next event)  │
        │ - No (skip to next event)       │
        └─────────────────────────────────┘
```

## Existing Flow Continuity

All other events (Wedding, Engagement, Birthday, etc.) maintain their original flow:
```
EventSelection → Service Selection → Confirmation → Next Event
```

Only Pre-Wedding/Post-Wedding has the additional selection step:
```
EventSelection → Pre/Post Selection → Duration → Service Selection → Confirmation → Next Event
```

## Navigation History

The back button correctly handles the new step:
- From PrePostWeddingSelection → Back to EventSelection
- From Duration → Back to PrePostWeddingSelection
- From Services → Back to Duration

## Testing Checklist

- [ ] Click "Pre-Wedding/Post-Wedding" card on EventSelection
- [ ] Verify PrePostWeddingSelection appears (STEP 1.2)
- [ ] Select "Pre-Wedding" option
- [ ] Verify duration screen appears with correct event type
- [ ] Select "Post-Wedding" option
- [ ] Verify duration screen appears with correct event type
- [ ] Back button navigates correctly
- [ ] Mobile responsive design works
- [ ] Other events still navigate normally (no Pre/Post selection)
- [ ] Quote summary includes correct event selection
- [ ] Prices calculate correctly for pre/post events

## Key Files Modified

| File | Change |
|------|--------|
| `src/App.jsx` | Added import and route for PrePostWeddingSelection |
| `src/pages/QuotationBuilder/EventSelection.jsx` | Added handleEventClick interceptor |
| `FOLDER_STRUCTURE_GUIDE.md` | New documentation |
| `PRE_POST_WEDDING_IMPLEMENTATION.md` | New documentation (this file) |

## Key Files Created

| File | Purpose |
|------|---------|
| `PrePostWeddingSelection/PrePostWeddingSelection.jsx` | Main selection component |
| `PrePostWeddingSelection/PrePostWeddingSelection.css` | Component styling |
| `PrePostWeddingSelection/index.js` | Module export |
| `PrePostWeddingSelection/README.md` | Component documentation |

## Future Enhancements

1. **Image Gallery**: Add image previews for pre-wedding vs post-wedding styles
2. **Pricing Preview**: Show estimated costs for each type
3. **Style Examples**: Display past shoots as references
4. **Duration Comparison**: Show what's included at each duration level
5. **Custom Packages**: Allow users to mix pre and post-wedding shots
6. **Timeline Selection**: Let users choose specific dates for shoots

## API/Backend Considerations

Current implementation is frontend-only. Backend should support:
- Store selected event type (pre-wedding or post-wedding) in quotation
- Differentiate pricing if pre/post have different rates
- Track which type was selected in customer quotes
- Generate appropriate documentation/contracts based on selection

## Notes for Developers

- Component follows existing design patterns from EventSelection and EventConfirmation
- Uses consistent styling with golden gradient (#d4af37, #f5d76e)
- Fully responsive and mobile-friendly
- Accessible with proper ARIA attributes
- Navigation handled through App.jsx state management
- No breaking changes to existing event flows

## Questions or Issues?

Refer to:
- `src/pages/QuotationBuilder/PrePostWeddingSelection/README.md` - Component details
- `FOLDER_STRUCTURE_GUIDE.md` - Overall architecture
- `src/App.jsx` - State management and routing logic
