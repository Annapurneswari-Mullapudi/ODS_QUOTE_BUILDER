import { useState, useEffect } from 'react'
import odsLogo from '../../../assets/OdsLogo.jpeg'
import photosCameraImg from '../../../assets/photosCameraImg.jpeg'
import videosCameraImg from '../../../assets/videosCameraImg.jpg'
import camera1Img from '../../../assets/camera1Img.jpeg'
import camera2Img from '../../../assets/camera2Img.jpeg'
import droneImg from '../../../assets/droneImg.jpeg'
import audienceCameraImg from '../../../assets/audienceCameraImg.jpeg'
import './OtherEventsServices.css'

const OtherEventsServices = ({ selectedEvents, cumulativeTotalPrice, onBack, onNext, eventServicesMemory, finalizedEvents, customEventName }) => {
  const [selectedServices, setSelectedServices] = useState(new Set())
  const [serviceQuantities, setServiceQuantities] = useState({})
  const [totalPrice, setTotalPrice] = useState(0)
  const [expandedSummary, setExpandedSummary] = useState(false)
  const [eventName, setEventName] = useState(customEventName || '')
  const [errorMessage, setErrorMessage] = useState('')

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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

  // Initialize selectedServices from memory if available
  useEffect(() => {
    if (eventServicesMemory && eventServicesMemory['other-events']) {
      const { services, totalPrice: savedTotalPrice, quantities: savedQuantities } = eventServicesMemory['other-events']
      setSelectedServices(new Set(services))
      setServiceQuantities(savedQuantities || {})
      setTotalPrice(savedTotalPrice)
    }
  }, [eventServicesMemory])

  const handleServiceToggle = (serviceId, price) => {
    const newSelected = new Set(selectedServices)
    const newQuantities = { ...serviceQuantities }
    
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId)
      delete newQuantities[serviceId]
      setTotalPrice(totalPrice - price * (newQuantities[serviceId] || 1))
    } else {
      newSelected.add(serviceId)
      newQuantities[serviceId] = 1
      setTotalPrice(totalPrice + price)
    }
    setSelectedServices(newSelected)
    setServiceQuantities(newQuantities)
  }

  const handleQuantityChange = (serviceId, price, change) => {
    const currentQuantity = serviceQuantities[serviceId] || 1
    const newQuantity = currentQuantity + change

    if (newQuantity < 1) {
      const newSelected = new Set(selectedServices)
      newSelected.delete(serviceId)
      const newQuantities = { ...serviceQuantities }
      delete newQuantities[serviceId]
      
      setSelectedServices(newSelected)
      setServiceQuantities(newQuantities)
      setTotalPrice(totalPrice - price)
      return
    }

    const newQuantities = { ...serviceQuantities }
    newQuantities[serviceId] = newQuantity
    setServiceQuantities(newQuantities)
    
    const priceChange = price * change
    setTotalPrice(totalPrice + priceChange)
  }

  const eventsTotalPrice = cumulativeTotalPrice + totalPrice

  const handleNextStep = () => {
    setErrorMessage('')
    
    if (!eventName.trim()) {
      alert('Enter event name first')
      return
    }
    
    if (selectedServices.size === 0) {
      setErrorMessage('Please select at least one service')
      return
    }
    
    onNext(Array.from(selectedServices), totalPrice, serviceQuantities, eventName.trim())
  }

  return (
    <div className="services-selection-container">
      {/* Header */}
      <header className="ss-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          ←
        </button>
        <div className="header-logo">
          <img src={odsLogo} alt="One Day Stories" />
        </div>
        <div className="header-spacer"></div>
      </header>

      {/* Main Content */}
      <main className="ss-main">
        {/* Step Indicator */}
        <div className="step-indicator">
          <p className="step-number">STEP 1.2</p>
        </div>

        {/* Title Section */}
        <section className="ss-title-section">
          <h1 className="ss-title">Other Events</h1>
          <p className="ss-subtitle">
            <>Tell us about your event and choose the services<br />that will help us capture every moment.</>
          </p>
          <div className="divider-line"></div>
        </section>

        {/* Event Name Input Section */}
        <section className="event-name-section">
          <div className="event-name-container">
            <div className="event-name-label-box">
              <label htmlFor="event-name-input" className="event-name-label">
                Enter Event Name <span className="required-asterisk">*</span>
              </label>
            </div>
            <div className="event-name-input-box">
              <input
                id="event-name-input"
                type="text"
                className="event-name-input"
                placeholder="e.g., Corporate Event, Anniversary Party, Product Launch"
                value={eventName}
                onChange={(e) => {
                  setEventName(e.target.value)
                  if (errorMessage) setErrorMessage('')
                }}
              />
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="services-grid">
          {allServices.map((service) => (
            <div
              key={service.id}
              className={`service-card ${selectedServices.has(service.id) ? 'selected' : ''}`}
              onClick={() => handleServiceToggle(service.id, service.price)}
              role="button"
              tabIndex={0}
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
                  <p className="service-price">₹ {service.price.toLocaleString()}</p>
                  
                  {/* Quantity Controls */}
                  {selectedServices.has(service.id) && (
                    <div className="quantity-controls" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="qty-btn qty-minus"
                        onClick={() => handleQuantityChange(service.id, service.price, -1)}
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
          ))}
        </section>

        {/* Summary Footer */}
        <section className="ss-footer">
          <div className={`summary-box ${expandedSummary ? 'expanded' : ''}`}>
            <div className="summary-left">
              <div className="event-icon">🎉</div>
              <p className="event-selected">
                <span className="event-count">
                  {selectedServices.size > 0 
                    ? `${selectedServices.size} SERVICE${selectedServices.size !== 1 ? 'S' : ''} SELECTED`
                    : '0 SERVICES SELECTED'}
                </span>
                <br />
                {eventName && <span className="event-badge">• {eventName.toUpperCase()}</span>}
              </p>
            </div>
            <div className="summary-right">
              <div className="prices-container">
                <div className="price-item">
                  <p className="services-total-price">₹ {totalPrice.toLocaleString()}</p>
                  <p className="price-label">Budget of this event </p>
                </div>
                <button 
                  className="dropdown-btn" 
                  onClick={() => setExpandedSummary(!expandedSummary)}
                >
                  {expandedSummary ? '▲' : '▼'}
                </button>
              </div>
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
              className={`btn-next ${(!eventName.trim() || selectedServices.size === 0) ? 'disabled-muted' : ''}`}
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

export default OtherEventsServices
