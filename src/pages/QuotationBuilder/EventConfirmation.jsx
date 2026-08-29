import { useState } from 'react'
import odsLogo from '../../assets/OdsLogo.jpeg'
import './EventConfirmation.css'

const EventConfirmation = ({ eventType, onBack, onNext }) => {
  const [selectedOption, setSelectedOption] = useState(null)

  const options = [
    {
      id: 'yes',
      title: 'Yes!',
      description: 'Yes, capture every moment.',
      icon: '✓',
      isPositive: true
    },
    {
      id: 'no',
      title: 'No',
      description: "We'll skip this one.",
      icon: '✕',
      isPositive: false
    }
  ]

  const getTitle = (eventId) => {
    const titles = {
      'pre-wedding': 'Do you want us to cover your Pre-Wedding?',
      'engagement': 'Do you want us to cover your Engagement?',
      'groom': 'Do you want us to cover the Groom Making?',
      'groom-haldi': 'Do you want us to cover the Groom Haldi?',
      'bride-making': 'Do you want us to cover the Bride Making?',
      'bride-haldi': 'Do you want us to cover the Bride Haldi?',
      'reception': 'Do you want us to cover the Reception?',
      'vratham': 'Do you want us to cover the Vratham?',
      'sangeeth': 'Do you want us to cover the Sangeeth?',
      'mehandi': 'Do you want us to cover the Mehandi Function?',
      'after-party': 'Do you want us to cover the After-Party?',
      'post-wedding': 'Do you want us to cover the Post-Wedding Shoot?',
      'album': 'Do you need an Album?'
    }
    return titles[eventId] || 'Do you want us to cover your event?'
  }

  const getSubtitle = (eventId) => {
    const subtitles = {
      'pre-wedding': 'Choose the events that will help us capture every part of your special moments.',
      'engagement': 'Choose the events that will help us capture every part of your special moments.',
      'groom': 'Choose to capture special moments of the groom.',
      'groom-haldi': 'Choose to capture special moments of the groom haldi celebration.',
      'bride-making': 'Choose to capture special moments of the bride making celebration.',
      'bride-haldi': 'Choose to capture special moments of the bride haldi celebration.',
      'reception': 'Choose to capture special moments of the reception celebration.',
      'vratham': 'Choose to capture special moments of the vratham ceremony.',
      'sangeeth': 'Choose to capture special moments of the sangeeth celebration.',
      'mehandi': 'Choose to capture special moments of the mehandi function.',
      'after-party': 'Choose to capture special moments of the after-party celebration.',
      'post-wedding': 'Choose to capture special moments of the post-wedding shoot.',
      'album': 'A beautiful album to preserve your precious memories forever.'
    }
    return subtitles[eventId] || 'Choose the events that will help us capture every part of your special moments.'
  }

  const handleNextStep = () => {
    if (selectedOption) {
      onNext(selectedOption)
    }
  }

  const getStepNumber = () => {
    const stepMap = {
      'wedding': '2.1',
      'pre-wedding': '2.2',
      'engagement': '3.2',
      'groom': '4.1',
      'groom-haldi': '5.1',
      'bride-making': '6.1',
      'bride-haldi': '7.1',
      'reception': '8.1',
      'vratham': '9.1',
      'sangeeth': '10.1',
      'mehandi': '11.1',
      'after-party': '12.1',
      'post-wedding': '13.1',
      'album': '14.1'
    }
    return stepMap[eventType] || '2.1'
  }

  return (
    <div className="event-confirmation-container">
      {/* Header */}
      <header className="ec-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          ←
        </button>
        <div className="header-logo">
          <img src={odsLogo} alt="One Day Stories" style={{height: '80%'}}/>
        </div>
        <div className="header-spacer"></div>
      </header>

      {/* Main Content */}
      <main className="ec-main">
        {/* Step Indicator */}
        <div className="step-indicator">
          <p className="step-number">STEP {getStepNumber()}</p>
        </div>

        {/* Title Section */}
        <section className="ec-title-section">
          <h1 className="ec-title">{getTitle(eventType)}</h1>
          <p className="ec-subtitle">
            {getSubtitle(eventType)}
          </p>
          <div className="divider-line"></div>
        </section>

        {/* Options Grid */}
        <section className="options-grid">
          {options.map((option) => (
            <div
              key={option.id}
              className={`option-card ${selectedOption === option.id ? 'selected' : ''} ${option.isPositive ? 'positive' : 'negative'}`}
              onClick={() => setSelectedOption(option.id)}
              role="button"
              tabIndex={0}
              aria-pressed={selectedOption === option.id}
            >
              <div className="option-icon-container">
                <div className="option-icon">{option.icon}</div>
              </div>
              <h3 className="option-title">{option.title}</h3>
              <p className="option-description">{option.description}</p>
            </div>
          ))}
        </section>

        {/* Action Buttons */}
        <section className="ec-actions">
          <button className="btn-back" onClick={onBack}>
            ← BACK
          </button>
          <button
            className="btn-next"
            disabled={!selectedOption}
            onClick={handleNextStep}
          >
            NEXT STEP →
          </button>
        </section>
      </main>
    </div>
  )
}

export default EventConfirmation
