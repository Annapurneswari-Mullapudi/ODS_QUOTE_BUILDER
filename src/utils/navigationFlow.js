/**
 * Navigation Flow Management
 * Defines the complete step sequence for the quotation builder
 * Wedding flow: 1.1 → 1.2 → 2.1 → 2.2 → 2.3 → ... → 14.3
 */

// Define the complete step sequence
export const STEP_SEQUENCE = [
  // Step 1: Wedding Event Selection
  { step: '1.1', pageId: 'event-selection', label: 'Event Selection' },
  { step: '1.2', pageId: 'service-selection', label: 'Wedding Services' },

  // Step 2: Pre-Wedding
  { step: '2.1', pageId: 'pre-wedding-confirmation', label: 'Pre-Wedding Confirmation' },
  { step: '2.2', pageId: 'pre-wedding-duration', label: 'Pre-Wedding Duration' },
  { step: '2.3', pageId: 'pre-wedding-services', label: 'Pre-Wedding Services' },

  // Step 3: Engagement
  { step: '3.1', pageId: 'engagement-confirmation', label: 'Engagement Confirmation' },
  { step: '3.2', pageId: 'engagement-services', label: 'Engagement Services' },

  // Step 4: Groom
  { step: '4.1', pageId: 'groom-confirmation', label: 'Groom Confirmation' },
  { step: '4.2', pageId: 'groom-services', label: 'Groom Services' },

  // Step 5: Groom Haldi
  { step: '5.1', pageId: 'groom-haldi-confirmation', label: 'Groom Haldi Confirmation' },
  { step: '5.2', pageId: 'groom-haldi-services', label: 'Groom Haldi Services' },

  // Step 6: Bride Making
  { step: '6.1', pageId: 'bride-making-confirmation', label: 'Bride Making Confirmation' },
  { step: '6.2', pageId: 'bride-making-services', label: 'Bride Making Services' },

  // Step 7: Bride Haldi
  { step: '7.1', pageId: 'bride-haldi-confirmation', label: 'Bride Haldi Confirmation' },
  { step: '7.2', pageId: 'bride-haldi-services', label: 'Bride Haldi Services' },

  // Step 8: Reception
  { step: '8.1', pageId: 'reception-confirmation', label: 'Reception Confirmation' },
  { step: '8.2', pageId: 'reception-services', label: 'Reception Services' },

  // Step 9: Vratham
  { step: '9.1', pageId: 'vratham-confirmation', label: 'Vratham Confirmation' },
  { step: '9.2', pageId: 'vratham-services', label: 'Vratham Services' },

  // Step 10: Sangeeth
  { step: '10.1', pageId: 'sangeeth-confirmation', label: 'Sangeeth Confirmation' },
  { step: '10.2', pageId: 'sangeeth-services', label: 'Sangeeth Services' },

  // Step 11: Mehandi
  { step: '11.1', pageId: 'mehandi-confirmation', label: 'Mehandi Confirmation' },
  { step: '11.2', pageId: 'mehandi-services', label: 'Mehandi Services' },

  // Step 12: After Party
  { step: '12.1', pageId: 'after-party-confirmation', label: 'After Party Confirmation' },
  { step: '12.2', pageId: 'after-party-services', label: 'After Party Services' },

  // Step 13: Post Wedding
  { step: '13.1', pageId: 'post-wedding-confirmation', label: 'Post Wedding Confirmation' },
  { step: '13.2', pageId: 'post-wedding-duration', label: 'Post Wedding Duration' },
  { step: '13.3', pageId: 'post-wedding-services', label: 'Post Wedding Services' },

  // Step 14: Album
  { step: '14.1', pageId: 'album-confirmation', label: 'Album Confirmation' },
  { step: '14.2', pageId: 'album-size', label: 'Album Size' },
  { step: '14.3', pageId: 'delivery-time', label: 'Album Delivery Time' }
]

/**
 * Get the index of a page in the sequence
 */
export const getPageIndex = (pageId) => {
  return STEP_SEQUENCE.findIndex(item => item.pageId === pageId)
}

/**
 * Get the next page in the sequence
 */
export const getNextPage = (currentPageId) => {
  const currentIndex = getPageIndex(currentPageId)
  if (currentIndex === -1 || currentIndex === STEP_SEQUENCE.length - 1) {
    return null // Already at the end
  }
  return STEP_SEQUENCE[currentIndex + 1]
}

/**
 * Get the previous page in the sequence
 */
export const getPreviousPage = (currentPageId) => {
  const currentIndex = getPageIndex(currentPageId)
  if (currentIndex <= 0) {
    return null // Already at the beginning
  }
  return STEP_SEQUENCE[currentIndex - 1]
}

/**
 * Get all pages that come after the current page
 */
export const getPagesAfter = (pageId) => {
  const currentIndex = getPageIndex(pageId)
  if (currentIndex === -1) return []
  return STEP_SEQUENCE.slice(currentIndex + 1)
}

/**
 * Check if navigation to next step is allowed (e.g., certain conditions met)
 */
export const canNavigateToNext = (currentPageId, conditions = {}) => {
  const nextPage = getNextPage(currentPageId)
  if (!nextPage) return false

  // Add any specific conditions here based on currentPageId
  // For example: if (currentPageId === 'event-selection' && !selectedEvent) return false

  return true
}

/**
 * Get step number from page ID
 */
export const getStepFromPageId = (pageId) => {
  const item = STEP_SEQUENCE.find(s => s.pageId === pageId)
  return item ? item.step : null
}

export default {
  STEP_SEQUENCE,
  getPageIndex,
  getNextPage,
  getPreviousPage,
  getPagesAfter,
  canNavigateToNext,
  getStepFromPageId
}
