import { useState } from 'react'
import odsLogo from '../../assets/OdsLogo.jpeg'
import './PreWeddingDuration.css'

const PostWeddingDuration = ({ selectedEvents, cumulativeTotalPrice, onBack, onNext, postWeddingDurationId }) => {
  const [selectedDuration, setSelectedDuration] = useState(postWeddingDurationId || null)

  const durations = [
    {
      id: '1-day',
      days: '1 Day',
      hours: '6 hours',
      amount: 20000
    },
    {
      id: '2-days',
      days: '2 Days',
      hours: '12 hours',
      amount: 40000
    }
  ]

  const handleNextStep = () => {
    if (selectedDuration) {
      const selected = durations.find(d => d.id === selectedDuration)
      onNext(selectedDuration, selected.amount)
    }
  }

  const getEventName = (eventId) => {
    const eventNames = {
      'wedding': 'WEDDING',
      'pre-wedding': 'PRE-WEDDING',
      'engagement': 'ENGAGEMENT',
      'birthday': 'BIRTHDAY',
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

  return (
    <div className="pre-wedding-duration-container">
      {/* Header */}
      <header className="pwd-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          ←
        </button>
        <div className="header-logo">
          <img src={odsLogo} alt="One Day Stories" style={{height: '80%'}}/>
        </div>
        <div className="header-spacer"></div>
      </header>

      {/* Main Content */}
      <main className="pwd-main">
        {/* Step Indicator */}
        <div className="step-indicator">
          <p className="step-number">STEP 13.2</p>
        </div>

        {/* Title Section */}
        <section className="pwd-title-section">
          <h1 className="pwd-title">Choose Your Post-Wedding Duration</h1>
          <p className="pwd-subtitle">
            Select the duration that works best for capturing your special moments
          </p>
          <div className="divider-line"></div>
        </section>

        {/* Duration Options Grid */}
        <section className="duration-grid">
          {durations.map((duration) => (
            <div
              key={duration.id}
              className={`duration-card ${selectedDuration === duration.id ? 'selected' : ''}`}
              onClick={() => setSelectedDuration(duration.id)}
              role="button"
              tabIndex={0}
              aria-pressed={selectedDuration === duration.id}
            >
              <div className="duration-content">
                <h3 className="duration-days">{duration.days}</h3>
                <p className="duration-hours">{duration.hours}</p>
              </div>
              <div className="duration-footer">
                <p className="duration-amount">₹ {duration.amount.toLocaleString()}</p>
                <div className={`checkbox-container ${selectedDuration === duration.id ? 'checked' : ''}`}>
                  <div className="checkbox">
                    {selectedDuration === duration.id && <span className="checkmark">✓</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Total Budget Summary Box */}
        <section className="pwd-footer">
          <div className="pwd-summary-box">
            <div className="pwd-summary-left">
              <div className="pwd-event-icon">🎉</div>
              <p className="pwd-event-selected">
                <span className="pwd-event-count">
                  {selectedEvents && selectedEvents.length > 0 
                    ? `${selectedEvents.length} ${selectedEvents.length === 1 ? 'EVENT' : 'EVENTS'} SELECTED`
                    : '0 EVENTS SELECTED'}
                </span>
                <br />
                {selectedEvents && selectedEvents.length > 0 ? (
                  <span className="pwd-events-list">
                    {selectedEvents.map((event, index) => (
                      <span key={index} className="pwd-event-badge">
                        • {getEventName(event)}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="pwd-event-badge">No events selected</span>
                )}
              </p>
            </div>
            <div className="pwd-summary-right">
              <div className="pwd-prices-container">
                <div className="pwd-price-item">
                  <p className="pwd-services-total-price">₹ {selectedDuration ? (selectedDuration === '1-day' ? '20000' : '40000') : '0'}</p>
                  <p className="pwd-price-label">Budget of this event</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pwd-total-price-item">
            <span className="pwd-price-label">Total budget</span>
            <span className="pwd-events-total-price">
              ₹ {(cumulativeTotalPrice + (selectedDuration ? (selectedDuration === '1-day' ? 20000 : 40000) : 0)).toLocaleString()}
            </span>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="pwd-actions">
          <button className="btn-back" onClick={onBack}>
            ← BACK
          </button>
          <button
            className="btn-next"
            disabled={!selectedDuration}
            onClick={handleNextStep}
          >
            NEXT STEP →
          </button>
        </section>
      </main>
    </div>
  )
}

export default PostWeddingDuration
