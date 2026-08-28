import { useState } from 'react'
import odsLogo from '../../../assets/OdsLogo.jpeg'
import birthdayImg from '../../../assets/birthdayImg.jpeg'
import './BirthdaySelection.css'

const BirthdaySelection = ({ onBack, onNext }) => {
  const [selectedOption, setSelectedOption] = useState(null)

  const options = [
    {
      id: 'birthday',
      title: 'Birthday',
      description: 'Capture the joy and fun on their special day',
      image: birthdayImg
    },
    {
      id: 'pre-birthday',
      title: 'Pre-Birthday',
      description: 'Celebrate the anticipation before the party',
      image: birthdayImg
    }
  ]

  const handleNextStep = () => {
    if (selectedOption) {
      onNext(selectedOption)
    }
  }

  return (
    <div className="birthday-selection-container">
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
          <h1 className="ss-title">Choose Your Photography Type</h1>
          <p className="ss-subtitle">
            Select whether you want Birthday or Pre-Birthday photography.
          </p>
          <div className="divider-line"></div>
          
        </section>

        {/* Selection Containers */}
        <section className="birthday-grid">
          {options.map((option) => (
            <div
              key={option.id}
              className={`birthday-card ${selectedOption === option.id ? 'selected' : ''}`}
              onClick={() => setSelectedOption(option.id)}
              role="button"
              tabIndex={0}
              aria-pressed={selectedOption === option.id}
            >
              <div className="birthday-card-image">
                <img src={option.image} alt={option.title} />
                <div className="checkbox-container">
                  <div className={`checkbox ${selectedOption === option.id ? 'checked' : ''}`}>
                    <span className="checkmark">✓</span>
                  </div>
                </div>
              </div>
              <div className="birthday-card-content">
                <h3 className="birthday-card-title">{option.title}</h3>
                <p className="birthday-card-description">{option.description}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="ss-footer">
        <section className="ss-actions">
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
      </footer>
    </div>
  )
}

export default BirthdaySelection
