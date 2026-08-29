import { useState } from 'react'
import odsLogo from '../../assets/OdsLogo.jpeg'
import weddingImg from '../../assets/weddingImg.jpg'
import preWeddingImg from '../../assets/preWeddingImg.png'
import engagementImg from '../../assets/engagementImg.jpeg'
import birthdayImg from '../../assets/birthdayImg.jpeg'
import maternityImg from '../../assets/maternityImg.jpg'
import otherEventsImg from '../../assets/bottomCameraImg.png'
import './EventSelection.css'

const EventSelection = ({ onBack, onNext }) => {
  const [selectedEventType, setSelectedEventType] = useState(null)

  const eventTypes = [
    {
      id: 'wedding',
      title: 'Wedding',
      description: 'Every ritual, every year, every joyful blur',
      image: weddingImg,
      icon: '💍'
    },
    {
      id: 'pre-wedding',
      title: 'Pre-Wedding/Post-Wedding',
      description: 'Every ritual, every year, every joyful blur',
      image: preWeddingImg,
      icon: '💕'
    },
    {
      id: 'engagement',
      title: 'Engagement',
      description: 'Every ritual, every year, every joyful blur',
      image: engagementImg,
      icon: '💎'
    },
    {
      id: 'birthday',
      title: 'Birthday/Pre-Birthday',
      description: 'Every ritual, every year, every joyful blur',
      image: birthdayImg,
      icon: '🎂'
    },
    {
      id: 'maternity',
      title: 'Maternity',
      description: 'Every ritual, every year, every joyful blur',
      image: maternityImg,
      icon: '👶'
    },
    {
      id: 'other-events',
      title: 'Other Events',
      description: 'Every ritual, every year, every joyful blur',
      image: otherEventsImg,
      icon: '⭐'
    }
  ]

  return (
    <div className="event-selection-container">
      {/* Header */}
      <header className="qb-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          ←
        </button>
        <div className="header-logo">
          <img src={odsLogo} alt="One Day Stories" style={{height: '70%' }}/>
        </div>
        <div className="header-spacer"></div>
      </header>

      {/* Main Content */}
      <main className="qb-main">
        {/* Step Indicator */}
        <div className="step-indicator">
          <p className="step-number">STEP 1.1</p>
        </div>

        {/* Title Section */}
        <section className="qb-title-section">
          <h1 className="qb-title">What special moment brings you here?</h1>
          <p className="qb-subtitle">
            Tell us what you're celebrating, and we'll take it from there.
          </p>

          <div className="divider1"></div>
        </section>

        {/* <div className="divider"></div> */}

        {/* Event Type Grid */}
        <section className="event-grid">
          {eventTypes.map((event) => (
            <div
              key={event.id}
              className={`event-card ${selectedEventType === event.id ? 'selected' : ''}`}
              onClick={() => setSelectedEventType(event.id)}
              role="button"
              tabIndex={0}
              aria-pressed={selectedEventType === event.id}
            >
              <div className="event-card-image">
                <img src={event.image} alt={event.title} />
                <div className="event-card-icon">{event.icon}</div>
              </div>
              <div className="event-card-content">
                <h3 className="event-card-title">{event.title}</h3>
                <p className="event-card-description">{event.description}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Action Buttons */}
        <section className="qb-actions">
          <button
            className="btn-next"
            disabled={!selectedEventType}
            onClick={() => {
              if (selectedEventType === 'pre-wedding') {
                onNext('pre-post-wedding')
              } else {
                onNext(selectedEventType)
              }
            }}
          >
            Next Step →
          </button>
        </section>
      </main>
    </div>
  )
}

export default EventSelection
