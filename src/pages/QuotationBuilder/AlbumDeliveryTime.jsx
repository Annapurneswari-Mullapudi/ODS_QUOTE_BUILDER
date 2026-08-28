import { useState } from 'react'
import odsLogo from '../../assets/OdsLogo.jpeg'
import './AlbumDeliveryTime.css'

const AlbumDeliveryTime = ({ cumulativeTotalPrice, onBack, onNext }) => {
  const [selectedDelivery, setSelectedDelivery] = useState(null)

  const deliveryOptions = [
    {
      id: 'one-month',
      time: '1 Month',
      price: '40,000',
      icon: '📅'
    },
    {
      id: 'three-months',
      time: '3 Months',
      price: '30,000',
      icon: '📅'
    }
  ]

  const handleBuildQuote = () => {
    if (selectedDelivery) {
      onNext(selectedDelivery)
    }
  }

  return (
    <div className="delivery-time-container">
      {/* Header */}
      <header className="dt-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          ←
        </button>
        <div className="header-logo">
          <img src={odsLogo} alt="One Day Stories" />
        </div>
        <div className="header-spacer"></div>
      </header>

      {/* Main Content */}
      <main className="dt-main">
        {/* Step Indicator */}
        <div className="step-indicator">
          <p className="step-number">STEP 14.3</p>
        </div>

        {/* Title Section */}
        <section className="dt-title-section">
          <h1 className="dt-title">Album Delivery Time</h1>
          <p className="dt-subtitle">
            Choose your preferred delivery time and complete your quote.
          </p>
          <div className="divider-line"></div>
        </section>

        {/* Delivery Options Grid */}
        <section className="delivery-options-grid">
          {deliveryOptions.map((option) => (
            <div
              key={option.id}
              className={`delivery-card ${selectedDelivery === option.id ? 'selected' : ''}`}
              onClick={() => setSelectedDelivery(option.id)}
              role="button"
              tabIndex={0}
              aria-pressed={selectedDelivery === option.id}
            >
              <div className="delivery-icon-container">
                <div className="delivery-icon">{option.icon}</div>
              </div>
              <h3 className="delivery-time">{option.time}</h3>
              <p className="delivery-price">₹ {option.price}</p>
            </div>
          ))}
        </section>

        {/* Total Budget Section */}
        <section className="dt-budget-section">
          <div className="budget-display">
            <p className="budget-label">Your Total Budget</p>
            <p className="budget-amount">
              ₹ {(cumulativeTotalPrice + (selectedDelivery === 'one-month' ? 40000 : selectedDelivery === 'three-months' ? 30000 : 0)).toLocaleString()}
            </p>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="dt-actions">
          <button className="btn-back" onClick={onBack}>
            ← BACK
          </button>
          <button
            className="btn-quote"
            disabled={!selectedDelivery}
            onClick={handleBuildQuote}
          >
            BUILD MY QUOTE →
          </button>
        </section>
      </main>
    </div>
  )
}

export default AlbumDeliveryTime
