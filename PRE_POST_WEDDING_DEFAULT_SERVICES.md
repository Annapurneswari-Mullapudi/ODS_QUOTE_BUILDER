# Pre-Wedding & Post-Wedding Default Services - Non-Removable

## Summary
Pre-wedding and post-wedding services are now marked as **default services** and cannot be unselected or removed from the quote.

## Changes Made

### 1. ServicesSelectionScreen.jsx
- **handleServiceToggle()**: Prevents users from deselecting default services for pre-wedding and post-wedding events
- **handleQuantityChange()**: Prevents reducing quantity of default services below 1 for pre-wedding and post-wedding events
- **Service Card Rendering**: 
  - Added `disabled-default` class to prevent hover effects for default services
  - Added "DEFAULT" badge to indicate which services are pre-selected
  - Disabled minus button when quantity is at minimum for default services

### 2. QuoteSummary.jsx
- **handleQuantityChange()**: Prevents reducing the quantity of pre-wedding and post-wedding services (no -1 allowed)
- **Service Item Rendering**:
  - Added `disabled` attribute to minus button for pre-wedding and post-wedding events
  - Added `title` attribute showing "Cannot remove default services" on hover

### 3. ServicesSelectionScreen.css
- Added `.service-card.disabled-default` styling to:
  - Remove hover transform effects
  - Show disabled cursor state
  - Display neutral styling
- Added `.default-badge` styling:
  - Gold/tan background color matching the UI theme
  - Dark text for contrast
  - Small font size positioned at bottom-left of service image

### 4. QuoteSummary.css
- Already had proper disabled button styling (`.qty-btn-edit:disabled`)
- Disabled buttons show reduced opacity and not-allowed cursor

## User Experience

### ServicesSelectionScreen
- Pre-wedding and post-wedding service cards display a "DEFAULT" badge
- Clicking the card does nothing (no toggle behavior)
- Quantity minus button is disabled when quantity = 1
- Users can still increase quantity with the plus button
- Hover effects don't apply to default service cards

### QuoteSummary
- Pre-wedding and post-wedding services display with disabled minus buttons
- The minus button shows reduced opacity and not-allowed cursor
- Users can still increase quantity with the plus button
- Tooltip shows "Cannot remove default services" on button hover
- Price not displayed for these services (as per existing design)

## Technical Details

**Default Services by Event Type:**
- `pre-wedding`: candid-photo, candid-video, drone
- `post-wedding`: candid-photo, candid-video, drone

These defaults are passed as `defaultServices` prop to `ServicesSelectionScreen` and are checked during user interactions to enforce the non-removable constraint.

## Verification
- Build passes without errors
- All styling integrated with existing theme
- Disabled states clearly visible to users
