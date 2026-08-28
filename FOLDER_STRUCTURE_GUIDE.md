# QuotationBuilder Folder Structure Guide

## Overview
The QuotationBuilder has been reorganized to create a more maintainable and scalable structure. Each event type now has its own folder, with shared components at the top level.

## Current Structure

```
src/pages/QuotationBuilder/
├── shared/                          # Shared components across all events
│   ├── EventSelection.jsx          # Main event selection screen
│   ├── EventConfirmation.jsx       # Confirmation dialog (used by all events)
│   ├── ServicesSelectionScreen.jsx # Service selection (used by all events)
│   ├── AlbumSize.jsx               # Album selection
│   ├── AlbumDeliveryTime.jsx       # Delivery time selection
│   └── QuoteSummary.jsx            # Final quote summary
│
├── Wedding/                        # Wedding-specific flows
│   └── index.js                    # Wedding module (future expansion)
│
├── PrePostWeddingSelection/        # Pre/Post Wedding selection
│   ├── PrePostWeddingSelection.jsx # Choose between pre-wedding or post-wedding
│   ├── PrePostWeddingSelection.css # Styles
│   ├── index.js                    # Module export
│   └── README.md                   # Pre/Post wedding flow documentation
│
├── PreWeddingDuration/             # Pre-Wedding duration selection
│   ├── PreWeddingDuration.jsx      # Duration selection component
│   └── PreWeddingDuration.css      # Styles
│
├── PostWeddingDuration/            # Post-Wedding duration selection
│   ├── PostWeddingDuration.jsx     # Duration selection component
│   └── PostWeddingDuration.css     # Styles
│
├── Engagement/                     # Engagement-specific flows
│   └── index.js                    # Engagement module (future expansion)
│
├── OtherEvents/                    # Birthday, Maternity, Other Events
│   └── index.js                    # Other events module (future expansion)
│
└── index.js                        # Main export

```

## Event Flow

### Event Selection Flow
1. User lands on EventSelection screen (STEP 1.1)
2. Selects one of 6 event types:
   - Wedding
   - Pre-Wedding/Post-Wedding
   - Engagement
   - Birthday
   - Maternity
   - Other Events

### Pre-Wedding/Post-Wedding Special Flow
When user clicks on "Pre-Wedding/Post-Wedding" card:
1. Navigates to `PrePostWeddingSelection` (STEP 1.2)
2. User chooses between:
   - Pre-Wedding Shoot
   - Post-Wedding Shoot
3. Then proceeds to service selection based on choice

### Other Events Flow
1. EventSelection → EventConfirmation → Services → Confirmation
2. Each event has its own confirmation screen

## How to Add a New Event Type

1. **Create a new folder** under `QuotationBuilder/` with the event name
   ```bash
   mkdir src/pages/QuotationBuilder/MyEvent/
   ```

2. **Create event-specific components** if needed:
   - Duration selection (if applicable)
   - Special services screen
   - etc.

3. **Update App.jsx** with new event flow:
   - Add state variables for pricing/duration
   - Add handler functions
   - Add rendering conditions

4. **Update EventConfirmation.jsx**:
   - Add event type to `getTitle()` function
   - Add event type to `getSubtitle()` function
   - Add event type to `getStepNumber()` function

5. **Update EventSelection.jsx**:
   - Add new event card to eventTypes array

## File Organization Best Practices

- **Component files**: Place main component files in the event folder
- **Shared components**: Keep in top level or in a `shared` folder
- **CSS files**: Keep alongside component files (e.g., Component.jsx → Component.css)
- **Index files**: Export components for clean imports
- **README files**: Document event-specific flows and requirements

## Component Reusability

### Reused Across Events
- `EventConfirmation.jsx` - Generic yes/no confirmation
- `ServicesSelectionScreen.jsx` - Service selection with event-specific services
- `AlbumSize.jsx` - Album selection
- `QuoteSummary.jsx` - Final quote display

### Event-Specific Components
- `PreWeddingDuration.jsx` - Pre-wedding specific duration
- `PostWeddingDuration.jsx` - Post-wedding specific duration

## State Management

All state is managed in `App.jsx` using:
- `selectedEvent` - Currently selected event
- `eventServicesMemory` - Stores selected services/pricing for each event
- `finalizedEvents` - Set of events user confirmed
- `navigationHistory` - For back button functionality

## Navigation Map (from App.jsx)

```javascript
// Event IDs used in the system:
'wedding'          // Wedding event
'pre-wedding'      // Pre-wedding shoot
'post-wedding'     // Post-wedding shoot
'engagement'       // Engagement event
'groom'            // Groom making/preparation
'groom-haldi'      // Groom haldi ceremony
'bride-making'     // Bride preparation
'bride-haldi'      // Bride haldi ceremony
'reception'        // Reception event
'vratham'          // Vratham ceremony
'sangeeth'         // Sangeeth event
'mehandi'          // Mehandi function
'after-party'      // After-party event
'album'            // Album selection
```

## Next Steps for Reorganization

The following components should be moved to their respective folders for better organization:
- Move Wedding-related files → Wedding folder
- Move Engagement files → Engagement folder
- Move Duration files into event-specific subfolders
- Create shared folder for truly shared components

This structure keeps the codebase organized as more event types are added.
