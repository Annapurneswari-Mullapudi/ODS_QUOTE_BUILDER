import { useState, useEffect } from 'react'
import odsLogo from '../../assets/OdsLogo.jpeg'
import './AlbumSize.css'

const AlbumSize = ({ onBack, onNext, cumulativeTotalPrice, initialSelectedAlbums = {}, initialAlbumNotes = {} }) => {
  const [selectedSheets, setSelectedSheets] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedAlbums, setSelectedAlbums] = useState(initialSelectedAlbums.length > 0 ? initialSelectedAlbums.reduce((acc, album, idx) => {
    const key = `${album.sizeId}-${album.sheets}`
    acc[key] = {
      sizeId: album.sizeId,
      sheets: album.sheets,
      quantity: album.quantity,
      price: album.price
    }
    return acc
  }, {}) : {})
  const [albumNotes, setAlbumNotes] = useState(() => {
    // Initialize notes with proper key mapping from initialAlbumNotes
    if (initialSelectedAlbums.length > 0) {
      const notesMap = {}
      initialSelectedAlbums.forEach((album) => {
        const key = `${album.sizeId}-${album.sheets}`
        // Check if notes exist in initialAlbumNotes using the same key
        if (initialAlbumNotes[key]) {
          notesMap[key] = initialAlbumNotes[key]
        }
      })
      return notesMap
    }
    return initialAlbumNotes || {}
  })
  const [editingNoteKey, setEditingNoteKey] = useState(null)
  const [tempNoteValue, setTempNoteValue] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)

  // Calculate total price when albums change
  useEffect(() => {
    let total = 0
    Object.values(selectedAlbums).forEach(album => {
      total += album.price * album.quantity
    })
    setTotalPrice(total)
  }, [selectedAlbums])

  const sheets = [
    { id: '50', count: '50 sheets', label: '50 sheets' },
    { id: '100', count: '100 sheets', label: '100 sheets' },
    { id: '150', count: '150 sheets', label: '150 sheets' }
  ]

  const sizes = [
    { id: 'small', title: '8×10', description: 'Small' },
    { id: 'medium', title: '10×12', description: 'Medium' },
    { id: 'large', title: '12×36', description: 'Large' },
    { id: 'extra-large', title: '14×40', description: 'Extra Large' }
  ]

  const getPriceForSheets = (sheetCount) => {
    const priceMap = {
      '50': 20000,
      '100': 40000,
      '150': 60000
    }
    return priceMap[sheetCount] || 0
  }

  const handleSheetsChange = (sheetId) => {
    setSelectedSheets(sheetId)
    setSelectedSize(null) // Reset size when sheets change
  }

  const handleSizeChange = (sizeId) => {
    setSelectedSize(sizeId)
  }

  const handleAddAlbum = () => {
    if (!selectedSheets || !selectedSize) return

    const newSelectedAlbums = { ...selectedAlbums }
    const key = `${selectedSize}-${selectedSheets}`
    
    if (newSelectedAlbums[key]) {
      newSelectedAlbums[key].quantity += 1
    } else {
      newSelectedAlbums[key] = {
        sizeId: selectedSize,
        sheets: selectedSheets,
        quantity: 1,
        price: getPriceForSheets(selectedSheets)
      }
    }

    setSelectedAlbums(newSelectedAlbums)
    updateTotalPrice(newSelectedAlbums)
    setSelectedSize(null) // Reset size after adding
  }

  const handleRemoveAlbum = (key) => {
    const newSelectedAlbums = { ...selectedAlbums }
    delete newSelectedAlbums[key]
    setSelectedAlbums(newSelectedAlbums)
    
    // Also remove notes for this album
    const newNotes = { ...albumNotes }
    delete newNotes[key]
    setAlbumNotes(newNotes)
    
    updateTotalPrice(newSelectedAlbums)
  }

  const handleNotesChange = (key, notes) => {
    setAlbumNotes(prev => ({
      ...prev,
      [key]: notes
    }))
  }

  const startEditingNote = (key) => {
    setEditingNoteKey(key)
    setTempNoteValue(albumNotes[key] || '')
  }

  const saveNote = (key) => {
    handleNotesChange(key, tempNoteValue)
    setEditingNoteKey(null)
    setTempNoteValue('')
  }

  const cancelEditingNote = () => {
    setEditingNoteKey(null)
    setTempNoteValue('')
  }

  const handleQuantityChange = (key, change) => {
    const newSelectedAlbums = { ...selectedAlbums }
    const newQuantity = newSelectedAlbums[key].quantity + change

    if (newQuantity < 1) {
      delete newSelectedAlbums[key]
    } else {
      newSelectedAlbums[key].quantity = newQuantity
    }

    setSelectedAlbums(newSelectedAlbums)
    updateTotalPrice(newSelectedAlbums)
  }

  const updateTotalPrice = (albums) => {
    let total = 0
    Object.values(albums).forEach(album => {
      total += album.price * album.quantity
    })
    setTotalPrice(total)
  }

  const handleNextStep = () => {
    if (Object.keys(selectedAlbums).length > 0) {
      // Create a summary of selected albums with all details
      const albumsList = Object.values(selectedAlbums).map((album, index) => {
        const key = Object.entries(selectedAlbums)[index][0]
        const sizeObj = sizes.find(s => s.id === album.sizeId)
        return {
          sizeId: album.sizeId,
          sheets: album.sheets,
          quantity: album.quantity,
          price: album.price,
          title: sizeObj.title,
          description: sizeObj.description,
          notes: albumNotes[key] || ''
        }
      })
      
      // Pass all selected albums to the handler
      onNext(albumsList)
    }
  }

  const totalBudget = cumulativeTotalPrice + totalPrice
  const selectedAlbumsArray = Object.entries(selectedAlbums).map(([key, album]) => {
    const sizeObj = sizes.find(s => s.id === album.sizeId)
    return {
      key,
      sizeId: album.sizeId,
      sheets: album.sheets,
      quantity: album.quantity,
      price: album.price,
      title: sizeObj.title,
      totalPrice: album.price * album.quantity
    }
  })

  return (
    <div className="album-size-container">
      {/* Header */}
      <header className="as-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          ←
        </button>
        <div className="header-logo">
          <img src={odsLogo} alt="One Day Stories" />
        </div>
        <div className="header-spacer"></div>
      </header>

      {/* Main Content */}
      <main className="as-main">
        {/* Step Indicator */}
        <div className="step-indicator">
          <p className="step-number">STEP 14.2</p>
        </div>

        {/* Title Section */}
        <section className="as-title-section">
          <h1 className="as-title">Choose Your Album</h1>
          <p className="as-subtitle">
            Select the number of sheets and add different album sizes with quantities.
          </p>
          <div className="divider-line"></div>
        </section>

        {/* Album Selection Dropdowns */}
        <section className="album-selection-section">
          {/* Sheets Selection */}
          <div className="dropdown-group">
            <label className="dropdown-label">Number of Sheets</label>
            <select 
              className="dropdown-select"
              value={selectedSheets || ''}
              onChange={(e) => handleSheetsChange(e.target.value)}
            >
              <option value="">Select sheets</option>
              {sheets.map(sheet => (
                <option key={sheet.id} value={sheet.id}>
                  {sheet.label}
                </option>
              ))}
            </select>
          </div>

          {/* Album Size Selection - Only show if sheets selected */}
          {selectedSheets && (
            <div className="dropdown-group">
              <label className="dropdown-label">Album Size</label>
              <select 
                className="dropdown-select"
                value={selectedSize || ''}
                onChange={(e) => handleSizeChange(e.target.value)}
              >
                <option value="">Select your album size</option>
                {sizes.map(size => (
                  <option key={size.id} value={size.id}>
                    {size.title} - {size.description}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Add Album Button - Show when both selections made */}
          {selectedSheets && selectedSize && (
            <button
              className="btn-add-album"
              onClick={handleAddAlbum}
            >
              Add Album
            </button>
          )}
        </section>

        {/* Selected Albums List */}
        {selectedAlbumsArray.length > 0 && (
          <section className="selected-albums-section">
            <h3 className="selected-label">Selected Albums</h3>
            <div className="albums-list">
              {selectedAlbumsArray.map(album => (
                <div key={album.key} className="album-item">
                  <div className="album-info">
                    {/* Badge Row - Shows above on mobile, hidden on desktop */}
                    <div className="album-badge-row-mobile">
                      {editingNoteKey !== album.key ? (
                        <>
                          {albumNotes[album.key] && (
                            <span className="note-badge-display">
                              {albumNotes[album.key]}
                            </span>
                          )}
                          <button
                            className="note-badge-add"
                            onClick={() => startEditingNote(album.key)}
                            aria-label="Add note"
                          >
                            {albumNotes[album.key] ? '✎ Edit' : '+ Add Note'}
                          </button>
                        </>
                      ) : (
                        <div className="note-editing-inline">
                          <input
                            type="text"
                            className="note-input-inline"
                            placeholder="e.g., Wedding ceremony only"
                            value={tempNoteValue}
                            onChange={(e) => setTempNoteValue(e.target.value)}
                            autoFocus
                          />
                          <button
                            className="note-btn-tick"
                            onClick={() => saveNote(album.key)}
                            aria-label="Save note"
                          >
                            ✓
                          </button>
                          <button
                            className="note-btn-cancel"
                            onClick={cancelEditingNote}
                            aria-label="Cancel note"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Title Row with Badge - Shows beside on desktop, hidden on mobile */}
                    <div className="album-header-with-note">
                      <p className="album-name">{album.title} ({album.sheets})</p>
                      <div className="album-badge-row-desktop">
                        {editingNoteKey !== album.key ? (
                          <>
                            {albumNotes[album.key] && (
                              <span className="note-badge-display">
                                {albumNotes[album.key]}
                              </span>
                            )}
                            <button
                              className="note-badge-add"
                              onClick={() => startEditingNote(album.key)}
                              aria-label="Add note"
                            >
                              {albumNotes[album.key] ? '✎ Edit' : '+ Add Note'}
                            </button>
                          </>
                        ) : (
                          <div className="note-editing-inline">
                            <input
                              type="text"
                              className="note-input-inline"
                              placeholder="e.g., Wedding ceremony only"
                              value={tempNoteValue}
                              onChange={(e) => setTempNoteValue(e.target.value)}
                              autoFocus
                            />
                            <button
                              className="note-btn-tick"
                              onClick={() => saveNote(album.key)}
                              aria-label="Save note"
                            >
                              ✓
                            </button>
                            <button
                              className="note-btn-cancel"
                              onClick={cancelEditingNote}
                              aria-label="Cancel note"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p style={{ color: "#d4a574", fontSize: "16px", fontWeight: '500'}}>₹ {album.price.toLocaleString()}</p>
                  </div>
                  <div className="album-controls">
                    <button
                      className="qty-btn-album qty-minus"
                      onClick={() => handleQuantityChange(album.key, -1)}
                    >
                      −
                    </button>
                    <span className="qty-value">{album.quantity}</span>
                    <button
                      className="qty-btn-album qty-plus"
                      onClick={() => handleQuantityChange(album.key, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Notes Section for each album */}
              <div className="album-notes-container">
                <p className="notes-section-label">Album Notes (What to include)</p>
                {selectedAlbumsArray.map(album => (
                  <div key={album.key} className="album-note-item">
                    <label className="note-label">{album.title} ({album.sheets})</label>
                    <textarea
                      className="note-input"
                      placeholder={`e.g., Wedding ceremony only, or Haldi and Bride Making photos`}
                      value={albumNotes[album.key] || ''}
                      onChange={(e) => handleNotesChange(album.key, e.target.value)}
                      rows="3"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Summary Box */}
        <section className="as-footer">
          <div className="as-summary-box">
            <div className="as-summary-left">
              <div className="as-event-icon">📖</div>
              <p className="as-event-selected">
                <span className="as-event-count">{selectedAlbumsArray.length} ALBUM{selectedAlbumsArray.length !== 1 ? 'S' : ''} SELECTED</span>
                <br />
                <span className="as-event-badge">
                  {selectedAlbumsArray.length > 0
                    ? `Total quantity: ${selectedAlbumsArray.reduce((sum, a) => sum + a.quantity, 0)}`
                    : 'Select albums to get started'}
                </span>
              </p>
            </div>
            <div className="as-summary-right">
              <div className="as-prices-container">
                <div className="as-price-item">
                  <p className="as-services-total-price">₹ {totalPrice.toLocaleString()}</p>
                  <p className="as-price-label">Budget of albums</p>
                </div>
              </div>
            </div>
          </div>

          <div className="as-total-price-item">
            <span className="as-price-label">Total budget</span>
            <span className="as-events-total-price">₹ {totalBudget.toLocaleString()}</span>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="as-actions">
          <button className="btn-back" onClick={onBack}>
            ← BACK
          </button>
          <button
            className="btn-next"
            disabled={selectedAlbumsArray.length === 0}
            onClick={handleNextStep}
          >
            BUILD MY QUOTE →
          </button>
        </section>
      </main>
    </div>
  )
}

export default AlbumSize
