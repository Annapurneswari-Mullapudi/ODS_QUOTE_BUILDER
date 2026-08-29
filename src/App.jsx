import { useState } from 'react'
import backgroundO from './assets/backgroundO.png'
import odsLogo from './assets/OdsLogo.jpeg'
import buildQuoteImg from './assets/BuildQuoteTextImg.png'
import bottomCameraImg from './assets/bottomCameraImg.png'
import EventSelection from './pages/QuotationBuilder/EventSelection'
import PrePostWeddingSelection from './pages/QuotationBuilder/PrePostWeddingSelection/PrePostWeddingSelection'
import BirthdaySelection from './pages/QuotationBuilder/BirthdaySelection/BirthdaySelection'
import ServicesSelectionScreen from './pages/QuotationBuilder/ServicesSelectionScreen'
import OtherEventsServices from './pages/QuotationBuilder/OtherEventsServices/OtherEventsServices'
import EventConfirmation from './pages/QuotationBuilder/EventConfirmation'
import PreWeddingDuration from './pages/QuotationBuilder/PreWeddingDuration'
import PostWeddingDuration from './pages/QuotationBuilder/PostWeddingDuration'
import AlbumSize from './pages/QuotationBuilder/AlbumSize'
import QuoteSummary from './pages/QuotationBuilder/QuoteSummary'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [preWeddingDurationPrice, setPreWeddingDurationPrice] = useState(0)
  const [postWeddingDurationPrice, setPostWeddingDurationPrice] = useState(0)
  const [preWeddingDurationId, setPreWeddingDurationId] = useState(null)
  const [postWeddingDurationId, setPostWeddingDurationId] = useState(null)
  const [eventServicesMemory, setEventServicesMemory] = useState({})
  const [finalizedEvents, setFinalizedEvents] = useState(new Set())
  const [navigationHistory, setNavigationHistory] = useState([])
  const [selectedAlbumsMemory, setSelectedAlbumsMemory] = useState({})
  const [albumNotesMemory, setAlbumNotesMemory] = useState({})
  const [customEventName, setCustomEventName] = useState('')

  // Helper function to get selected event types from eventServicesMemory
  const getSelectedEventTypes = () => {
    return Object.keys(eventServicesMemory)
  }

  // Calculate cumulative total from ONLY finalized events
  // Once an event is finalized (user said YES at confirmation), its price is locked
  // Even if user goes back and edits, the price stays the same
  const calculateCumulativeTotal = () => {
    let total = 0
    finalizedEvents.forEach(eventType => {
      if (eventServicesMemory[eventType]) {
        // Only count finalized events - prevents duplication on back navigation
        total += eventServicesMemory[eventType].totalPrice || 0
      }
    })
    return total
  }

  // Calculate cumulative total EXCLUDING the current event
  // This prevents double-counting when displaying on the current event's services screen
  const calculateCumulativeTotalExcludingCurrent = (currentEventType) => {
    let total = 0
    finalizedEvents.forEach(eventType => {
      // Skip the current event to avoid adding it twice
      if (eventType !== currentEventType && eventServicesMemory[eventType]) {
        total += eventServicesMemory[eventType].totalPrice || 0
      }
    })
    return total
  }

  /**
   * Navigate to next step in the sequence
   * Maintains history for back button
   */
  const handleNavigateToNext = (nextPageId) => {
    if (currentPage !== 'landing') {
      setNavigationHistory([...navigationHistory, currentPage])
    }
    setCurrentPage(nextPageId)
  }

  /**
   * Navigate back to previous step
   * Uses the navigation history for exact reverse order
   */
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

  // ============ LANDING PAGE HANDLERS ============
  const handleGetStarted = () => {
    setCurrentPage('event-selection')
    setNavigationHistory([])
  }

  // ============ EVENT SELECTION (1.1) HANDLERS ============
  const handleEventSelected = (eventType) => {
    if (eventType === 'pre-post-wedding') {
      handleNavigateToNext('pre-post-wedding')
    } else if (eventType === 'birthday') {
      handleNavigateToNext('birthday-selection')
    } else if (eventType === 'other-events') {
      setSelectedEvent('other-events')
      handleNavigateToNext('other-events-services')
    } else {
      setSelectedEvent(eventType)
      handleNavigateToNext('service-selection')
    }
  }

  // ============ SERVICE SELECTION (1.2) HANDLERS ============
  const handleServiceNext = (services, totalPrice, quantities) => {
    // Store in memory with quantities
    setEventServicesMemory(prev => ({
      ...prev,
      [selectedEvent]: { services, totalPrice, quantities }
    }))
    // ⭐ Add to finalized events so it's included in budget calculations
    const newFinalized = new Set(finalizedEvents)
    newFinalized.add(selectedEvent)
    setFinalizedEvents(newFinalized)
    
    // Route based on selected event type
    if (selectedEvent === 'engagement' || selectedEvent === 'birthday' || selectedEvent === 'pre-birthday' || selectedEvent === 'maternity') {
      handleNavigateToNext('album-confirmation')
    } else if (selectedEvent === 'wedding') {
      // For wedding, go through the complete flow: wedding confirmation -> pre-wedding -> ... -> album
      handleNavigateToNext('wedding-confirmation')
    } else {
      handleNavigateToNext('pre-wedding-confirmation')
    }
  }

  // ============ CONFIRMATION HANDLERS ============
  // Generic handler for all confirmation screens
  const handleConfirmationNext = (option, eventType) => {
    if (option === 'yes') {
      const newFinalized = new Set(finalizedEvents)
      newFinalized.add(eventType)
      setFinalizedEvents(newFinalized)
      
      // Navigation map for YES responses
      const nextPageMap = {
        'wedding': 'pre-wedding-confirmation',
        'pre-wedding': 'pre-wedding-duration',
        'engagement': 'engagement-services',
        'groom': 'groom-services',
        'groom-haldi': 'groom-haldi-services',
        'bride-making': 'bride-making-services',
        'bride-haldi': 'bride-haldi-services',
        'reception': 'reception-services',
        'vratham': 'vratham-services',
        'sangeeth': 'sangeeth-services',
        'mehandi': 'mehandi-services',
        'after-party': 'after-party-services',
        'post-wedding': 'post-wedding-duration',
        'album': 'album-size'
      }
      handleNavigateToNext(nextPageMap[eventType])
    } else {
      // Remove from finalized if user says NO
      const newFinalized = new Set(finalizedEvents)
      newFinalized.delete(eventType)
      setFinalizedEvents(newFinalized)
      
      // Navigation map for NO responses
      const nextEventMap = {
        'wedding': 'quote-summary',
        'pre-wedding': 'engagement-confirmation',
        'engagement': 'groom-confirmation',
        'groom': 'groom-haldi-confirmation',
        'groom-haldi': 'bride-making-confirmation',
        'bride-making': 'bride-haldi-confirmation',
        'bride-haldi': 'reception-confirmation',
        'reception': 'vratham-confirmation',
        'vratham': 'sangeeth-confirmation',
        'sangeeth': 'mehandi-confirmation',
        'mehandi': 'after-party-confirmation',
        'after-party': 'post-wedding-confirmation',
        'post-wedding': 'album-confirmation',
        'album': 'quote-summary'
      }
      handleNavigateToNext(nextEventMap[eventType])
    }
  }

  // ============ DURATION HANDLERS ============
  const handlePreWeddingDurationNext = (durationId, durationPrice) => {
    setPreWeddingDurationId(durationId)
    setPreWeddingDurationPrice(durationPrice)
    handleNavigateToNext('pre-wedding-services')
  }

  const handlePostWeddingDurationNext = (durationId, durationPrice) => {
    setPostWeddingDurationId(durationId)
    setPostWeddingDurationPrice(durationPrice)
    handleNavigateToNext('post-wedding-services')
  }

  // ============ PRE-WEDDING SERVICES HANDLERS ============
  const handlePreWeddingServiceNext = (services, totalPrice, quantities) => {
    // totalPrice now includes: duration price + extra service charges
    // Store with the calculated totalPrice which includes all charges
    setEventServicesMemory(prev => ({
      ...prev,
      'pre-wedding': { services, totalPrice, quantities }
    }))
    // ⭐ Add to finalized events so it appears in quote summary
    const newFinalized = new Set(finalizedEvents)
    newFinalized.add('pre-wedding')
    setFinalizedEvents(newFinalized)
    
    handleNavigateToNext('engagement-confirmation')
  }

  // ============ ENGAGEMENT SERVICES HANDLERS ============
  const handleEngagementServiceNext = (services, totalPrice, quantities) => {
    setEventServicesMemory(prev => ({
      ...prev,
      'engagement': { services, totalPrice, quantities }
    }))
    // ⭐ Add to finalized events so it appears in quote summary
    const newFinalized = new Set(finalizedEvents)
    newFinalized.add('engagement')
    setFinalizedEvents(newFinalized)
    
    handleNavigateToNext('groom-confirmation')
  }

  // ============ WEDDING SERVICES HANDLERS ============
  const handleWeddingServiceNext = (services, totalPrice, quantities) => {
    setEventServicesMemory(prev => ({
      ...prev,
      'wedding': { services, totalPrice, quantities }
    }))
    // ⭐ Add to finalized events so it's included in budget calculations
    const newFinalized = new Set(finalizedEvents)
    newFinalized.add('wedding')
    setFinalizedEvents(newFinalized)
    
    handleNavigateToNext('groom-confirmation')
  }

  // ============ GROOM SERVICES HANDLERS ============
  const handleGroomServiceNext = (services, totalPrice, quantities) => {
    setEventServicesMemory(prev => ({
      ...prev,
      'groom': { services, totalPrice, quantities }
    }))
    handleNavigateToNext('groom-haldi-confirmation')
  }

  // ============ GROOM HALDI SERVICES HANDLERS ============
  const handleGroomHaldiServiceNext = (services, totalPrice, quantities) => {
    setEventServicesMemory(prev => ({
      ...prev,
      'groom-haldi': { services, totalPrice, quantities }
    }))
    handleNavigateToNext('bride-making-confirmation')
  }

  // ============ BRIDE MAKING SERVICES HANDLERS ============
  const handleBrideMakingServiceNext = (services, totalPrice, quantities) => {
    setEventServicesMemory(prev => ({
      ...prev,
      'bride-making': { services, totalPrice, quantities }
    }))
    handleNavigateToNext('bride-haldi-confirmation')
  }

  // ============ BRIDE HALDI SERVICES HANDLERS ============
  const handleBrideHaldiServiceNext = (services, totalPrice, quantities) => {
    setEventServicesMemory(prev => ({
      ...prev,
      'bride-haldi': { services, totalPrice, quantities }
    }))
    handleNavigateToNext('reception-confirmation')
  }

  // ============ RECEPTION SERVICES HANDLERS ============
  const handleReceptionServiceNext = (services, totalPrice, quantities) => {
    setEventServicesMemory(prev => ({
      ...prev,
      'reception': { services, totalPrice, quantities }
    }))
    handleNavigateToNext('vratham-confirmation')
  }

  // ============ VRATHAM SERVICES HANDLERS ============
  const handleVrathamServiceNext = (services, totalPrice, quantities) => {
    setEventServicesMemory(prev => ({
      ...prev,
      'vratham': { services, totalPrice, quantities }
    }))
    handleNavigateToNext('sangeeth-confirmation')
  }

  // ============ SANGEETH SERVICES HANDLERS ============
  const handleSangeethServiceNext = (services, totalPrice, quantities) => {
    setEventServicesMemory(prev => ({
      ...prev,
      'sangeeth': { services, totalPrice, quantities }
    }))
    handleNavigateToNext('mehandi-confirmation')
  }

  // ============ MEHANDI SERVICES HANDLERS ============
  const handleMehandiServiceNext = (services, totalPrice, quantities) => {
    setEventServicesMemory(prev => ({
      ...prev,
      'mehandi': { services, totalPrice, quantities }
    }))
    handleNavigateToNext('after-party-confirmation')
  }

  // ============ AFTER PARTY SERVICES HANDLERS ============
  const handleAfterPartyServiceNext = (services, totalPrice, quantities) => {
    setEventServicesMemory(prev => ({
      ...prev,
      'after-party': { services, totalPrice, quantities }
    }))
    handleNavigateToNext('post-wedding-confirmation')
  }

  // ============ POST WEDDING SERVICES HANDLERS ============
  const handlePostWeddingServiceNext = (services, totalPrice, quantities) => {
    // totalPrice now includes: duration price + extra service charges
    // Store with the calculated totalPrice which includes all charges
    setEventServicesMemory(prev => ({
      ...prev,
      'post-wedding': { services, totalPrice, quantities }
    }))
    // ⭐ Add to finalized events so it appears in quote summary
    const newFinalized = new Set(finalizedEvents)
    newFinalized.add('post-wedding')
    setFinalizedEvents(newFinalized)
    
    handleNavigateToNext('album-confirmation')
  }

  // ============ OTHER EVENTS SERVICES HANDLERS ============
  const handleOtherEventsServiceNext = (services, totalPrice, quantities, eventName) => {
    // Store with event name
    setEventServicesMemory(prev => ({
      ...prev,
      'other-events': { services, totalPrice, quantities, eventName }
    }))
    // ⭐ Add to finalized events so it's included in budget calculations
    const newFinalized = new Set(finalizedEvents)
    newFinalized.add('other-events')
    setFinalizedEvents(newFinalized)
    // Store custom event name for later reference
    setCustomEventName(eventName)
    
    handleNavigateToNext('album-confirmation')
  }

  // ============ ALBUM HANDLERS ============
  const handleAlbumConfirmationNext = (option) => {
    if (option === 'yes') {
      handleNavigateToNext('album-size')
    } else {
      // User selected NO for album - don't add it to finalized events
      handleNavigateToNext('quote-summary')
    }
  }

  const handleAlbumSizeNext = (selectedAlbums) => {
    // selectedAlbums is an array of album objects from AlbumSize component
    // Each album has: { sizeId, sheets, quantity, price, title, notes }
    
    // Calculate total price for all albums
    let totalAlbumPrice = 0
    selectedAlbums.forEach(album => {
      totalAlbumPrice += album.price * album.quantity
    })
    
    // Store selected albums in memory
    setSelectedAlbumsMemory(selectedAlbums)
    
    // Store album notes with proper keying (sizeId-sheets)
    const notesMap = {}
    selectedAlbums.forEach((album) => {
      const key = `${album.sizeId}-${album.sheets}`
      if (album.notes) {
        notesMap[key] = album.notes
      }
    })
    setAlbumNotesMemory(notesMap)
    
    setEventServicesMemory(prev => ({
      ...prev,
      'album': {
        albums: selectedAlbums,
        totalPrice: totalAlbumPrice
      }
    }))
    
    // ⭐ Add album to finalized events so it's included in final quote
    const newFinalized = new Set(finalizedEvents)
    newFinalized.add('album')
    setFinalizedEvents(newFinalized)
    
    handleNavigateToNext('quote-summary')
  }

  // ============ QUOTE SUMMARY HANDLER ============
  const handleQuoteSummaryQuantityChange = (updatedEvents) => {
    // Update eventServicesMemory with the changes made in QuoteSummary
    updatedEvents.forEach(event => {
      if (eventServicesMemory[event.eventType]) {
        if (event.eventType === 'album' && event.albums) {
          // For albums, update both selectedAlbumsMemory and eventServicesMemory
          setSelectedAlbumsMemory(event.albums)
          
          // Recalculate total price
          let totalAlbumPrice = 0
          event.albums.forEach(album => {
            totalAlbumPrice += album.price * album.quantity
          })
          
          setEventServicesMemory(prev => ({
            ...prev,
            'album': {
              albums: event.albums,
              totalPrice: totalAlbumPrice
            }
          }))
        } else {
          // For other events, update as before
          setEventServicesMemory(prev => ({
            ...prev,
            [event.eventType]: {
              ...prev[event.eventType],
              services: event.services,
              quantities: event.quantities,
              totalPrice: event.totalPrice
            }
          }))
        }
      }
    })
  }

  // ============ QUOTE SUMMARY HANDLER ============
  const handleQuoteSummaryDownload = () => {
    console.log('Quote summary download requested')
  }

  // ============ PAGE RENDERING ============
  if (currentPage === 'event-selection') {
    return <EventSelection onBack={handleNavigateBack} onNext={handleEventSelected} />
  }

  if (currentPage === 'pre-post-wedding') {
    return (
      <PrePostWeddingSelection 
        onBack={handleNavigateBack} 
        onNext={(option) => {
          setSelectedEvent(option)
          if (option === 'pre-wedding') {
            handleNavigateToNext('pre-wedding-duration')
          } else if (option === 'post-wedding') {
            handleNavigateToNext('post-wedding-duration')
          }
        }}
      />
    )
  }

  if (currentPage === 'birthday-selection') {
    return (
      <BirthdaySelection 
        onBack={handleNavigateBack} 
        onNext={(option) => {
          setSelectedEvent(option)
          handleNavigateToNext('service-selection')
        }}
      />
    )
  }

  if (currentPage === 'service-selection') {
    return (
      <ServicesSelectionScreen
        eventType={selectedEvent}
        selectedEvents={[selectedEvent]}
        cumulativeTotalPrice={calculateCumulativeTotalExcludingCurrent(selectedEvent)}
        onBack={handleNavigateBack}
        onNext={handleServiceNext}
        eventServicesMemory={eventServicesMemory}
        finalizedEvents={finalizedEvents}
      />
    )
  }

  if (currentPage === 'wedding-confirmation') {
    return (
      <EventConfirmation
        key="wedding-confirmation"
        eventType="wedding"
        onBack={handleNavigateBack}
        onNext={(option) => handleConfirmationNext(option, 'wedding')}
      />
    )
  }

  if (currentPage === 'wedding-services') {
    return (
      <ServicesSelectionScreen
        eventType="wedding"
        selectedEvents={[...getSelectedEventTypes(), 'wedding']}
        cumulativeTotalPrice={calculateCumulativeTotalExcludingCurrent('wedding')}
        onBack={handleNavigateBack}
        onNext={handleWeddingServiceNext}
        eventServicesMemory={eventServicesMemory}
        finalizedEvents={finalizedEvents}
      />
    )
  }

  if (currentPage === 'pre-wedding-confirmation') {
    return (
      <EventConfirmation
        key="pre-wedding-confirmation"
        eventType="pre-wedding"
        onBack={handleNavigateBack}
        onNext={(option) => handleConfirmationNext(option, 'pre-wedding')}
      />
    )
  }

  if (currentPage === 'pre-wedding-duration') {
    return (
      <PreWeddingDuration
        selectedEvents={[...getSelectedEventTypes(), 'pre-wedding']}
        cumulativeTotalPrice={calculateCumulativeTotal()}
        onBack={handleNavigateBack}
        onNext={handlePreWeddingDurationNext}
        preWeddingDurationId={preWeddingDurationId}
      />
    )
  }

  if (currentPage === 'pre-wedding-services') {
    return (
      <ServicesSelectionScreen
        eventType="pre-wedding"
        selectedEvents={[selectedEvent, 'pre-wedding']}
        cumulativeTotalPrice={calculateCumulativeTotalExcludingCurrent('pre-wedding')}
        onBack={handleNavigateBack}
        onNext={handlePreWeddingServiceNext}
        hideServicePrices={true}
        eventBudget={preWeddingDurationPrice}
        eventServicesMemory={eventServicesMemory}
        finalizedEvents={finalizedEvents}
        defaultServices={['candid-photo', 'candid-video', 'drone']}
      />
    )
  }

  if (currentPage === 'engagement-confirmation') {
    return (
      <EventConfirmation
        key="engagement-confirmation"
        eventType="engagement"
        onBack={handleNavigateBack}
        onNext={(option) => handleConfirmationNext(option, 'engagement')}
      />
    )
  }

  if (currentPage === 'engagement-services') {
    return (
      <ServicesSelectionScreen
        eventType="engagement"
        selectedEvents={[...getSelectedEventTypes(), 'engagement']}
        cumulativeTotalPrice={calculateCumulativeTotalExcludingCurrent('engagement')}
        onBack={handleNavigateBack}
        onNext={handleEngagementServiceNext}
        eventServicesMemory={eventServicesMemory}
        finalizedEvents={finalizedEvents}
      />
    )
  }

  if (currentPage === 'groom-confirmation') {
    return (
      <EventConfirmation
        key="groom-confirmation"
        eventType="groom"
        onBack={handleNavigateBack}
        onNext={(option) => handleConfirmationNext(option, 'groom')}
      />
    )
  }

  if (currentPage === 'groom-services') {
    return (
      <ServicesSelectionScreen
        eventType="groom"
        selectedEvents={[...getSelectedEventTypes(), 'groom']}
        cumulativeTotalPrice={calculateCumulativeTotalExcludingCurrent('groom')}
        onBack={handleNavigateBack}
        onNext={handleGroomServiceNext}
        eventServicesMemory={eventServicesMemory}
        finalizedEvents={finalizedEvents}
      />
    )
  }

  if (currentPage === 'groom-haldi-confirmation') {
    return (
      <EventConfirmation
        key="groom-haldi-confirmation"
        eventType="groom-haldi"
        onBack={handleNavigateBack}
        onNext={(option) => handleConfirmationNext(option, 'groom-haldi')}
      />
    )
  }

  if (currentPage === 'groom-haldi-services') {
    return (
      <ServicesSelectionScreen
        eventType="groom-haldi"
        selectedEvents={[...getSelectedEventTypes(), 'groom-haldi']}
        cumulativeTotalPrice={calculateCumulativeTotalExcludingCurrent('groom-haldi')}
        onBack={handleNavigateBack}
        onNext={handleGroomHaldiServiceNext}
        eventServicesMemory={eventServicesMemory}
        finalizedEvents={finalizedEvents}
      />
    )
  }

  if (currentPage === 'bride-making-confirmation') {
    return (
      <EventConfirmation
        key="bride-making-confirmation"
        eventType="bride-making"
        onBack={handleNavigateBack}
        onNext={(option) => handleConfirmationNext(option, 'bride-making')}
      />
    )
  }

  if (currentPage === 'bride-making-services') {
    return (
      <ServicesSelectionScreen
        eventType="bride-making"
        selectedEvents={[...getSelectedEventTypes(), 'bride-making']}
        cumulativeTotalPrice={calculateCumulativeTotalExcludingCurrent('bride-making')}
        onBack={handleNavigateBack}
        onNext={handleBrideMakingServiceNext}
        eventServicesMemory={eventServicesMemory}
        finalizedEvents={finalizedEvents}
      />
    )
  }

  if (currentPage === 'bride-haldi-confirmation') {
    return (
      <EventConfirmation
        key="bride-haldi-confirmation"
        eventType="bride-haldi"
        onBack={handleNavigateBack}
        onNext={(option) => handleConfirmationNext(option, 'bride-haldi')}
      />
    )
  }

  if (currentPage === 'bride-haldi-services') {
    return (
      <ServicesSelectionScreen
        eventType="bride-haldi"
        selectedEvents={[...getSelectedEventTypes(), 'bride-haldi']}
        cumulativeTotalPrice={calculateCumulativeTotalExcludingCurrent('bride-haldi')}
        onBack={handleNavigateBack}
        onNext={handleBrideHaldiServiceNext}
        eventServicesMemory={eventServicesMemory}
        finalizedEvents={finalizedEvents}
      />
    )
  }

  if (currentPage === 'reception-confirmation') {
    return (
      <EventConfirmation
        key="reception-confirmation"
        eventType="reception"
        onBack={handleNavigateBack}
        onNext={(option) => handleConfirmationNext(option, 'reception')}
      />
    )
  }

  if (currentPage === 'reception-services') {
    return (
      <ServicesSelectionScreen
        eventType="reception"
        selectedEvents={[...getSelectedEventTypes(), 'reception']}
        cumulativeTotalPrice={calculateCumulativeTotalExcludingCurrent('reception')}
        onBack={handleNavigateBack}
        onNext={handleReceptionServiceNext}
        eventServicesMemory={eventServicesMemory}
        finalizedEvents={finalizedEvents}
      />
    )
  }

  if (currentPage === 'vratham-confirmation') {
    return (
      <EventConfirmation
        key="vratham-confirmation"
        eventType="vratham"
        onBack={handleNavigateBack}
        onNext={(option) => handleConfirmationNext(option, 'vratham')}
      />
    )
  }

  if (currentPage === 'vratham-services') {
    return (
      <ServicesSelectionScreen
        eventType="vratham"
        selectedEvents={[...getSelectedEventTypes(), 'vratham']}
        cumulativeTotalPrice={calculateCumulativeTotalExcludingCurrent('vratham')}
        onBack={handleNavigateBack}
        onNext={handleVrathamServiceNext}
        eventServicesMemory={eventServicesMemory}
        finalizedEvents={finalizedEvents}
      />
    )
  }

  if (currentPage === 'sangeeth-confirmation') {
    return (
      <EventConfirmation
        key="sangeeth-confirmation"
        eventType="sangeeth"
        onBack={handleNavigateBack}
        onNext={(option) => handleConfirmationNext(option, 'sangeeth')}
      />
    )
  }

  if (currentPage === 'sangeeth-services') {
    return (
      <ServicesSelectionScreen
        eventType="sangeeth"
        selectedEvents={[...getSelectedEventTypes(), 'sangeeth']}
        cumulativeTotalPrice={calculateCumulativeTotalExcludingCurrent('sangeeth')}
        onBack={handleNavigateBack}
        onNext={handleSangeethServiceNext}
        eventServicesMemory={eventServicesMemory}
        finalizedEvents={finalizedEvents}
      />
    )
  }

  if (currentPage === 'mehandi-confirmation') {
    return (
      <EventConfirmation
        key="mehandi-confirmation"
        eventType="mehandi"
        onBack={handleNavigateBack}
        onNext={(option) => handleConfirmationNext(option, 'mehandi')}
      />
    )
  }

  if (currentPage === 'mehandi-services') {
    return (
      <ServicesSelectionScreen
        eventType="mehandi"
        selectedEvents={[...getSelectedEventTypes(), 'mehandi']}
        cumulativeTotalPrice={calculateCumulativeTotalExcludingCurrent('mehandi')}
        onBack={handleNavigateBack}
        onNext={handleMehandiServiceNext}
        eventServicesMemory={eventServicesMemory}
        finalizedEvents={finalizedEvents}
      />
    )
  }

  if (currentPage === 'after-party-confirmation') {
    return (
      <EventConfirmation
        key="after-party-confirmation"
        eventType="after-party"
        onBack={handleNavigateBack}
        onNext={(option) => handleConfirmationNext(option, 'after-party')}
      />
    )
  }

  if (currentPage === 'after-party-services') {
    return (
      <ServicesSelectionScreen
        eventType="after-party"
        selectedEvents={[...getSelectedEventTypes(), 'after-party']}
        cumulativeTotalPrice={calculateCumulativeTotalExcludingCurrent('after-party')}
        onBack={handleNavigateBack}
        onNext={handleAfterPartyServiceNext}
        eventServicesMemory={eventServicesMemory}
        finalizedEvents={finalizedEvents}
      />
    )
  }

  if (currentPage === 'post-wedding-confirmation') {
    return (
      <EventConfirmation
        key="post-wedding-confirmation"
        eventType="post-wedding"
        onBack={handleNavigateBack}
        onNext={(option) => handleConfirmationNext(option, 'post-wedding')}
      />
    )
  }

  if (currentPage === 'post-wedding-duration') {
    return (
      <PostWeddingDuration
        selectedEvents={[...getSelectedEventTypes(), 'post-wedding']}
        cumulativeTotalPrice={calculateCumulativeTotal()}
        onBack={handleNavigateBack}
        onNext={handlePostWeddingDurationNext}
        postWeddingDurationId={postWeddingDurationId}
      />
    )
  }

  if (currentPage === 'post-wedding-services') {
    return (
      <ServicesSelectionScreen
        eventType="post-wedding"
        selectedEvents={[...getSelectedEventTypes(), 'post-wedding']}
        cumulativeTotalPrice={calculateCumulativeTotalExcludingCurrent('post-wedding')}
        onBack={handleNavigateBack}
        onNext={handlePostWeddingServiceNext}
        hideServicePrices={true}
        eventBudget={postWeddingDurationPrice}
        eventServicesMemory={eventServicesMemory}
        finalizedEvents={finalizedEvents}
        defaultServices={['candid-photo', 'candid-video', 'drone']}
      />
    )
  }

  if (currentPage === 'other-events-services') {
    return (
      <OtherEventsServices
        selectedEvents={[...getSelectedEventTypes(), 'other-events']}
        cumulativeTotalPrice={calculateCumulativeTotalExcludingCurrent('other-events')}
        onBack={handleNavigateBack}
        onNext={handleOtherEventsServiceNext}
        eventServicesMemory={eventServicesMemory}
        finalizedEvents={finalizedEvents}
        customEventName={customEventName}
      />
    )
  }

  if (currentPage === 'album-confirmation') {
    return (
      <EventConfirmation
        key="album-confirmation"
        eventType="album"
        onBack={handleNavigateBack}
        onNext={handleAlbumConfirmationNext}
      />
    )
  }

  if (currentPage === 'album-size') {
    return (
      <AlbumSize
        cumulativeTotalPrice={calculateCumulativeTotalExcludingCurrent('album')}
        onBack={handleNavigateBack}
        onNext={handleAlbumSizeNext}
        initialSelectedAlbums={selectedAlbumsMemory}
        initialAlbumNotes={albumNotesMemory}
      />
    )
  }

  if (currentPage === 'quote-summary') {
    // Build quote from ONLY finalized events
    // Ensures only events user confirmed (said YES to) are included in final quote
    // Define the order in which events should appear in the quote
    const eventOrder = [
      'wedding', 'pre-wedding', 'post-wedding', 'engagement', 'birthday', 'pre-birthday', 'maternity', 'other-events',
      'groom', 'groom-haldi', 'bride-making', 'bride-haldi', 'reception', 'vratham', 
      'sangeeth', 'mehandi', 'after-party', 'album'
    ]
    
    // Build quote events in the correct order
    const quoteEvents = eventOrder
      .filter(eventType => finalizedEvents.has(eventType))
      .map(eventType => ({
        eventType,
        services: eventServicesMemory[eventType]?.services || [],
        quantities: eventServicesMemory[eventType]?.quantities || {},
        totalPrice: eventServicesMemory[eventType]?.totalPrice || 0,
        sizeTitle: eventServicesMemory[eventType]?.sizeTitle || undefined,
        sizeDescription: eventServicesMemory[eventType]?.sizeDescription || undefined,
        quantity: eventServicesMemory[eventType]?.quantity || undefined,
        albums: eventServicesMemory[eventType]?.albums || [],
        eventName: eventServicesMemory[eventType]?.eventName || undefined
      }))
    
    return (
      <QuoteSummary
        quoteData={{ events: quoteEvents }}
        onBack={handleNavigateBack}
        onDownload={handleQuoteSummaryDownload}
        onQuantityChange={handleQuoteSummaryQuantityChange}
      />
    )
  }

  // LANDING PAGE (default)
  return (
    <div className="app-container">
      {/* Background O - Top Left with low opacity */}
      <div className="background-o">
        <img src={backgroundO} alt="" />
      </div>

      {/* Main Content */}
      <main className="main-content">
        {/* Header with Logo */}
        <header className="header">
          <div className="logo-container">
            <img src={odsLogo} alt="One Day Stories" className="main-logo" />
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          {/* Build Quote Text Image */}
          <div className="quote-text-container">
            <img src={buildQuoteImg} alt="Build your quote" className="quote-image" />
          </div>

          {/* Description Text */}
          <p className="description">
            From the first smile to the final celebration, we turn your special moments into memories that last a lifetime.
          </p>

          {/* Divider */}
          <div className="divider"></div>

          {/* CTA Button */}
          <button className="cta-button" onClick={handleGetStarted}>
            <span className="camera-icon">📷</span>
            GET STARTED
            <span className="arrow">→</span>
          </button>

          {/* Tagline */}
          <p className="tagline">Every Moment | Every Emotion | Forever Yours</p>
        </section>

        {/* Bottom Camera Image */}
        <footer className="footer">
          <div className="footer-content">
            <p className="footer-text">
              <span className="script-text">Every moment has a story</span>
              <br />
              <span className="script-text">Let's tell it beautifully</span>
            </p>
            <div className="camera-container">
              <img src={bottomCameraImg} alt="Professional camera" className="bottom-camera" />
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
