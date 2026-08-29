import { useState, useEffect } from 'react'
import odsLogo from '../../assets/OdsLogo.jpeg'
import photosCameraImg from '../../assets/photosCameraImg.jpeg'
import videosCameraImg from '../../assets/videosCameraImg.jpg'
import camera1Img from '../../assets/camera1Img.jpeg'
import camera2Img from '../../assets/camera2Img.jpeg'
import droneImg from '../../assets/droneImg.jpeg'
import audienceCameraImg from '../../assets/audienceCameraImg.jpeg'
import './ServicesSelectionScreen.css'

const ServicesSelectionScreen = ({ eventType, selectedEvents, cumulativeTotalPrice, onBack, onNext, hideServicePrices, eventBudget, eventServicesMemory, defaultServices }) => {
  const [selectedServices, setSelectedServices] = useState(new Set())
  const [serviceQuantities, setServiceQuantities] = useState({})
  const [totalPrice, setTotalPrice] = useState(0)
  const [expandedSummary, setExpandedSummary] = useState(false)

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [eventType])

  const allServices = [
    {
      id: 'traditional-photo',
      title: 'Traditional Photo',
      description: "Classic poses you'll treasure forever",
      price: 5000,
      icon: '📷',
      image: photosCameraImg
    },
    {
      id: 'traditional-video',
      title: 'Traditional Video',
      description: "Classic poses you'll treasure forever",
      price: 5000,
      icon: '🎬',
      image: videosCameraImg
    },
    {
      id: 'candid-photo',
      title: 'Candid Photo',
      description: "Classic poses you'll treasure forever",
      price: 8000,
      icon: '📸',
      image: camera1Img
    },
    {
      id: 'candid-video',
      title: 'Candid Video',
      description: "Classic poses you'll treasure forever",
      price: 10000,
      icon: '🎥',
      image: camera2Img
    },
    {
      id: 'drone',
      title: 'Drone',
      description: "Classic poses you'll treasure forever",
      price: 8000,
      icon: '🚁',
      image: droneImg
    },
    {
      id: 'audience-video',
      title: 'Audience Video',
      description: "Classic poses you'll treasure forever",
      price: 8000,
      icon: '📹',
      image: audienceCameraImg
    }
  ]

  // Initialize selectedServices from memory if available, or use defaultServices
  useEffect(() => {
    if (eventServicesMemory && eventServicesMemory[eventType]) {
      const { services, totalPrice: savedTotalPrice, quantities: savedQuantities } = eventServicesMemory[eventType]
      setSelectedServices(new Set(services))
      setServiceQuantities(savedQuantities || {})
      setTotalPrice(savedTotalPrice)
    } else if (defaultServices && defaultServices.length > 0) {
      // Auto-select default services if available
      setSelectedServices(new Set(defaultServices))
      const quantities = {}
      defaultServices.forEach(serviceId => {
        quantities[serviceId] = 1
      })
      setServiceQuantities(quantities)
      
      // Calculate total price for default services
      let totalServicePrice = 0
      allServices.forEach(service => {
        if (defaultServices.includes(service.id)) {
          totalServicePrice += service.price
        }
      })
      setTotalPrice(totalServicePrice)
    }
  }, [eventType, eventServicesMemory, defaultServices])

  const getServicesForEvent = (event) => {
    const serviceMap = {
      'wedding': ['traditional-photo', 'traditional-video', 'candid-photo', 'candid-video', 'drone', 'audience-video'],
      'pre-wedding': ['candid-photo', 'candid-video', 'drone'],
      'engagement': ['traditional-photo', 'traditional-video', 'candid-photo', 'candid-video', 'drone', 'audience-video'],
      'birthday': ['traditional-photo', 'traditional-video', 'candid-photo', 'candid-video', 'drone', 'audience-video'],
      'pre-birthday': ['traditional-photo', 'traditional-video', 'candid-photo', 'candid-video', 'drone', 'audience-video'],
      'maternity': ['traditional-photo', 'traditional-video', 'candid-photo', 'candid-video', 'drone', 'audience-video'],
      'groom': ['traditional-photo', 'traditional-video', 'candid-photo', 'candid-video'],
      'groom-haldi': ['traditional-photo', 'traditional-video', 'candid-photo', 'candid-video'],
      'bride-making': ['traditional-photo', 'traditional-video', 'candid-photo', 'candid-video'],
      'bride-haldi': ['traditional-photo', 'traditional-video', 'candid-photo', 'candid-video'],
      'reception': ['traditional-photo', 'traditional-video', 'candid-photo', 'candid-video', 'drone', 'audience-video'],
      'vratham': ['traditional-photo', 'traditional-video'],
      'sangeeth': ['traditional-photo', 'traditional-video', 'candid-photo', 'candid-video', 'drone'],
      'mehandi': ['traditional-photo', 'traditional-video', 'candid-photo', 'candid-video'],
      'after-party': ['traditional-photo', 'traditional-video', 'candid-photo', 'candid-video', 'drone'],
      'post-wedding': ['candid-photo', 'candid-video', 'drone']
    }
    const serviceIds = serviceMap[event] || []
    return allServices.filter(service => serviceIds.includes(service.id))
  }

  const services = getServicesForEvent(eventType)

  const calculateExtraServiceCharges = () => {
    // Calculate total extra charges for pre-wedding/post-wedding
    const isPreOrPostWedding = eventType === 'pre-wedding' || eventType === 'post-wedding'
    if (!isPreOrPostWedding) return 0

    let extraCharges = 0
    Array.from(selectedServices).forEach(serviceId => {
      const quantity = serviceQuantities[serviceId] || 1
      const service = allServices.find(s => s.id === serviceId)
      if (service && quantity > 1) {
        // Only charge for quantities > 1
        extraCharges += service.price * (quantity - 1)
      }
    })
    return extraCharges
  }

  // Calculate total price from all events
  // cumulativeTotalPrice is OTHER finalized events (excluding current)
  // So we ADD the current event's price to get the full total
  const extraServiceCharges = calculateExtraServiceCharges()
  const currentEventPrice = hideServicePrices && eventBudget 
    ? eventBudget + extraServiceCharges          // Duration price + extra charges
    : totalPrice
  const eventsTotalPrice = cumulativeTotalPrice + currentEventPrice

  const handleServiceToggle = (serviceId, price) => {
    // Prevent deselecting default services for pre-wedding and post-wedding
    const isDefaultService = defaultServices && defaultServices.includes(serviceId)
    const isPreOrPostWedding = eventType === 'pre-wedding' || eventType === 'post-wedding'
    
    if (isDefaultService && isPreOrPostWedding) {
      return // Don't allow deselection of default services
    }

    const newSelected = new Set(selectedServices)
    const newQuantities = { ...serviceQuantities }
    
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId)
      delete newQuantities[serviceId]
      // Only deduct from total if we're showing prices
      if (!hideServicePrices) {
        setTotalPrice(totalPrice - price * (newQuantities[serviceId] || 1))
      }
    } else {
      newSelected.add(serviceId)
      newQuantities[serviceId] = 1
      // Only add to total if we're showing prices
      if (!hideServicePrices) {
        setTotalPrice(totalPrice + price)
      }
    }
    setSelectedServices(newSelected)
    setServiceQuantities(newQuantities)
  }

  const handleQuantityChange = (serviceId, price, change) => {
    // Prevent reducing default services below 1 for pre-wedding and post-wedding
    const isDefaultService = defaultServices && defaultServices.includes(serviceId)
    const isPreOrPostWedding = eventType === 'pre-wedding' || eventType === 'post-wedding'
    
    const currentQuantity = serviceQuantities[serviceId] || 1
    const newQuantity = currentQuantity + change

    // Don't allow reducing default services below 1
    if (isDefaultService && isPreOrPostWedding && newQuantity < 1) {
      return
    }

    if (newQuantity < 1) {
      // Deselect the service if quantity goes below 1
      const newSelected = new Set(selectedServices)
      newSelected.delete(serviceId)
      const newQuantities = { ...serviceQuantities }
      delete newQuantities[serviceId]
      
      setSelectedServices(newSelected)
      setServiceQuantities(newQuantities)
      
      if (!hideServicePrices) {
        setTotalPrice(totalPrice - price)
      }
      return
    }

    const newQuantities = { ...serviceQuantities }
    newQuantities[serviceId] = newQuantity
    setServiceQuantities(newQuantities)

    if (!hideServicePrices) {
      // For pre-wedding and post-wedding, only charge for quantities > 1
      let priceChange = 0
      if (isPreOrPostWedding) {
        // Only charge for extra quantities beyond 1
        if (newQuantity > 1 && currentQuantity === 1) {
          // Going from 1 to 2+, only charge for the extras
          priceChange = price * (newQuantity - 1)
        } else if (newQuantity > currentQuantity) {
          // Increasing quantity, charge for the additional units
          priceChange = price * (newQuantity - currentQuantity)
        } else if (newQuantity < currentQuantity) {
          // Decreasing quantity, reduce the charge
          priceChange = -price * (currentQuantity - newQuantity)
        }
      } else {
        // For other events, charge normally
        priceChange = price * change
      }
      
      setTotalPrice(totalPrice + priceChange)
    }
  }

  const getEventTitle = (eventId) => {
    const eventTitles = {
      'wedding': 'The Wedding Ceremony',
      'pre-wedding': 'The Pre-Wedding',
      'engagement': 'The Engagement',
      'birthday': 'The Birthday',
      'pre-birthday': 'The Pre-Birthday',
      'maternity': 'The Maternity Session',
      'groom': 'The Groom Making',
      'groom-haldi': 'The Groom Haldi',
      'bride-making': 'The Bride Making',
      'bride-haldi': 'The Bride Haldi',
      'reception': 'The Reception',
      'vratham': 'The Vratham',
      'sangeeth': 'The Sangeeth',
      'mehandi': 'The Mehandi Function',
      'after-party': 'The After-Party',
      'post-wedding': 'The Post-Wedding Shoot',
      'other-events': 'The Event'
    }
    return eventTitles[eventId] || 'The Ceremony'
  }

  const getEventName = (eventId) => {
    const eventNames = {
      'wedding': 'WEDDING',
      'pre-wedding': 'PRE-WEDDING',
      'engagement': 'ENGAGEMENT',
      'birthday': 'BIRTHDAY',
      'pre-birthday': 'PRE-BIRTHDAY',
      'maternity': 'MATERNITY',
      'groom': 'GROOM MAKING',
      'groom-haldi': 'GROOM HALDI',
      'bride-making': 'BRIDE MAKING',
      'bride-haldi': 'BRIDE HALDI',
      'reception': 'RECEPTION',
      'vratham': 'VRATHAM',
      'sangeeth': 'SANGEETH',
      'mehandi': 'MEHANDI FUNCTION',
      'after-party': 'AFTER-PARTY',
      'post-wedding': 'POST-WEDDING SHOOT',
      'other-events': 'OTHER EVENTS'
    }
    return eventNames[eventId] || 'EVENT'
  }

  const handleNextStep = () => {
    if (selectedServices.size > 0) {
      // For pre-wedding and post-wedding, calculate: duration price + extra service charges
      let finalPrice = totalPrice
      
      if (eventType === 'pre-wedding' || eventType === 'post-wedding') {
        // Start with the duration price (eventBudget) and add extra charges
        const extraCharges = calculateExtraServiceCharges()
        finalPrice = (eventBudget || 0) + extraCharges
      }
      
      onNext(Array.from(selectedServices), finalPrice, serviceQuantities)
    }
  }

  const getStepNumber = () => {
    const stepMap = {
      'wedding': '1.2',
      'pre-wedding': '3.1',
      'engagement': '3.3',
      'groom': '4.2',
      'groom-haldi': '5.2',
      'bride-making': '6.2',
      'bride-haldi': '7.2',
      'reception': '8.2',
      'vratham': '9.2',
      'sangeeth': '10.2',
      'mehandi': '11.2',
      'after-party': '12.2',
      'post-wedding': '13.3'
    }
    return stepMap[eventType] || '1.2'
  }

  return (
    <div className="services-selection-container">
      {/* Header */}
      <header className="ss-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          ←
        </button>
        <div className="header-logo">
          <img src={odsLogo} alt="One Day Stories" style={{ height: '80%' }}/>
        </div>
        <div className="header-spacer"></div>
      </header>

      {/* Main Content */}
      <main className="ss-main">
        {/* Step Indicator */}
        <div className="step-indicator">
          <p className="step-number">STEP {getStepNumber()}</p>
        </div>

        {/* Title Section */}
        <section className="ss-title-section">
          <h1 className="ss-title">{getEventTitle(eventType)}</h1>
          <p className="ss-subtitle">
            {eventType === 'pre-wedding' 
              ? "You'll get these premium services for your pre-wedding shoot"
              : eventType === 'post-wedding'
              ? "You'll get these premium services for your post-wedding shoot"
              : <>Choose the services that will help us<br />capture every moment.</>
            }
        </p>
          <div className="divider-line"></div>
        </section>

        {/* Services Grid */}
        <section className="services-grid">
          {services.map((service) => {
            const isDefaultService = defaultServices && defaultServices.includes(service.id)
            const isPreOrPostWedding = eventType === 'pre-wedding' || eventType === 'post-wedding'
            const isDisabled = isDefaultService && isPreOrPostWedding

            return (
            <div
              key={service.id}
              className={`service-card ${selectedServices.has(service.id) ? 'selected' : ''} ${isDisabled ? 'disabled-default' : ''}`}
              onClick={() => handleServiceToggle(service.id, service.price)}
              role="button"
              tabIndex={isDisabled ? -1 : 0}
              aria-pressed={selectedServices.has(service.id)}
            >
              <div className="service-image">
                <img src={service.image} alt={service.title} />
                <div className="checkbox-container">
                  <div className={`checkbox ${selectedServices.has(service.id) ? 'checked' : ''}`}>
                    {selectedServices.has(service.id) && <span className="checkmark">✓</span>}
                  </div>
                </div>
              </div>
              <div className="service-content">
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <div className="service-footer">
                  {!hideServicePrices && <p className="service-price">₹ {service.price.toLocaleString()}</p>}
                  
                  {/* Quantity Controls */}
                  {selectedServices.has(service.id) && (
                    <div className="quantity-controls" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="qty-btn qty-minus"
                        onClick={() => handleQuantityChange(service.id, service.price, -1)}
                        disabled={isDisabled && serviceQuantities[service.id] === 1}
                      >
                        −
                      </button>
                      <span className="qty-value">{serviceQuantities[service.id] || 1}</span>
                      <button 
                        className="qty-btn qty-plus"
                        onClick={() => handleQuantityChange(service.id, service.price, 1)}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            )
          })}
        </section>

        {/* Summary Footer */}
        <section className="ss-footer">
          <div className={`summary-box ${expandedSummary ? 'expanded' : ''}`}>
            <div className="summary-left">
              <div className="event-icon">🎉</div>
              <p className="event-selected">
                <span className="event-count">
                  {selectedEvents && selectedEvents.length > 0 
                    ? `${selectedEvents.length} ${selectedEvents.length === 1 ? 'EVENT' : 'EVENTS'} SELECTED`
                    : '1 EVENT SELECTED'}
                </span>
                <br />
                {selectedEvents && selectedEvents.length > 0 ? (
                  <span className="events-list">
                    {selectedEvents.map((event, index) => (
                      <span key={index} className="event-badge">
                        • {getEventName(event)}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="event-badge">{getEventName(eventType)}</span>
                )}
              </p>
            </div>
            <div className="summary-right">
              <div className="prices-container">
                <div className="price-item">
                  {/* <span className="price-label">Budget of this event </span> */}
                  <p className="services-total-price">₹ {currentEventPrice.toLocaleString()}</p>
                  <p className="price-label">Budget of this event </p>
                </div>
                <button 
                  className="dropdown-btn" 
                  onClick={() => setExpandedSummary(!expandedSummary)}
                >
                  {expandedSummary ? '▲' : '▼'}
                </button>
              </div>
              {/* <div className="price-divider"></div>
              <div className="price-item">
                <span className="price-label">Total budget </span>
                <span className="events-total-price">₹ {eventsTotalPrice.toLocaleString()}</span>
              </div> */}
            </div>
          </div>

          <div className="total-price-item">
            <span className="price-label">Total budget   </span>
            <span className="events-total-price"> ₹ {eventsTotalPrice.toLocaleString()}</span>
          </div>

          {/* Action Buttons */}
          <div className="ss-actions">
            <button className="btn-back" onClick={onBack}>
              ← BACK
            </button>
            <button
              className="btn-next"
              disabled={selectedServices.size === 0}
              onClick={handleNextStep}
            >
              NEXT STEP →
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ServicesSelectionScreen
