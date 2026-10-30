import { useState } from 'react'
import odsLogo from '../../assets/OdsLogo.jpeg'
import './QuoteSummary.css'

const QuoteSummary = ({ quoteData, onBack, onDownload, onQuantityChange }) => {
  const [expandedEvent, setExpandedEvent] = useState(null)
  const [showAllEvents, setShowAllEvents] = useState(false)
  const [localEvents, setLocalEvents] = useState(quoteData.events)
  const [clientName, setClientName] = useState('')
  const [customDeliverables, setCustomDeliverables] = useState([])
  const [newDeliverable, setNewDeliverable] = useState({ title: '', quantity: '1', price: '' })

  const handleNewDeliverableChange = (field, value) => {
    const sanitized = field === 'title' ? value : value.replace(/[^\d]/g, '')
    setNewDeliverable(prev => ({ ...prev, [field]: sanitized }))
  }

  const handleAddDeliverable = () => {
    const title = newDeliverable.title.trim()
    if (!title) return
    const quantity = Number(newDeliverable.quantity) || 1
    const price = Number(newDeliverable.price) || 0
    setCustomDeliverables(prev => [...prev, { title, quantity, price }])
    setNewDeliverable({ title: '', quantity: '1', price: '' })
  }

  const handleRemoveDeliverable = (index) => {
    setCustomDeliverables(prev => prev.filter((_, i) => i !== index))
  }

  const toggleEventExpanded = (eventType) => {
    setExpandedEvent(expandedEvent === eventType ? null : eventType)
  }

  const getEventTitle = (eventId, eventName) => {
    if (eventId === 'other-events' && eventName) {
      return `The ${eventName}`
    }
    
    const eventTitles = {
      'wedding': 'The Wedding Ceremony',
      'pre-wedding': 'The Pre-Wedding',
      'post-wedding': 'The Post-Wedding Shoot',
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
      'album': 'The Album'
    }
    return eventTitles[eventId] || 'The Event'
  }

  const getServiceName = (serviceId) => {
    const serviceNames = {
      'traditional-photo': 'Traditional Photo',
      'traditional-video': 'Traditional Video',
      'candid-photo': 'Candid Photo',
      'candid-video': 'Candid Video',
      'drone': 'Drone',
      'audience-video': 'Audience Video',
      'one-month': '1 Month Album Delivery',
      'three-months': '3 Months Album Delivery'
    }
    return serviceNames[serviceId] || serviceId
  }

  const getServicePrice = (serviceId) => {
    const servicePrices = {
      'traditional-photo': 5000,
      'traditional-video': 5000,
      'candid-photo': 8000,
      'candid-video': 10000,
      'drone': 8000,
      'audience-video': 8000,
      'one-month': 40000,
      'three-months': 30000
    }
    return servicePrices[serviceId] || 0
  }

  const getServiceQuantity = (event, serviceId) => {
    if (event.quantities && event.quantities[serviceId]) {
      return event.quantities[serviceId]
    }
    return 1
  }

  const getAlbumSizeDisplay = (event) => {
    if (event.eventType !== 'album') return null
    
    // Handle new multi-album format
    if (event.albums && Array.isArray(event.albums)) {
      return event.albums
    }
    
    // Fallback for old format
    const title = event.sizeTitle || 'Album'
    const description = event.sizeDescription ? ` (${event.sizeDescription})` : ''
    const quantity = event.quantity || 1
    return `${title}${description} x${quantity}`
  }

  const handleQuantityChange = (eventType, serviceId, change) => {
    // For pre-wedding and post-wedding, allow decrease down to 1 (not 0)
    const isPreOrPostWedding = eventType === 'pre-wedding' || eventType === 'post-wedding'

    const updatedEvents = localEvents.map(event => {
      if (event.eventType === eventType) {
        const newQuantities = { ...event.quantities }
        const currentQty = newQuantities[serviceId] || 1
        const newQty = currentQty + change

        // For pre/post-wedding, don't allow going below 1
        if (isPreOrPostWedding && newQty < 1) {
          return event // Don't update, stay at 1
        }

        if (newQty < 1) {
          // Remove the service if quantity goes below 1
          delete newQuantities[serviceId]
          const updatedServices = event.services.filter(s => s !== serviceId)
          const unitPrice = getServicePrice(serviceId)
          const newTotalPrice = event.totalPrice - (unitPrice * currentQty)

          return {
            ...event,
            services: updatedServices,
            quantities: newQuantities,
            totalPrice: newTotalPrice
          }
        }

        newQuantities[serviceId] = newQty
        const unitPrice = getServicePrice(serviceId)
        
        // For pre-wedding and post-wedding, only charge for extra quantities (> 1)
        let priceChange = 0
        if (isPreOrPostWedding) {
          // Only charge for the extra quantity
          if (newQty > 1 && currentQty === 1) {
            // Going from 1 to 2+, charge for the new quantity
            priceChange = unitPrice
          } else if (newQty > currentQty) {
            // Increasing quantity, charge for the difference
            priceChange = unitPrice * (newQty - currentQty)
          } else if (newQty < currentQty) {
            // Decreasing quantity, reduce the charge
            priceChange = -unitPrice * (currentQty - newQty)
          }
        } else {
          // For other events, charge normally
          priceChange = unitPrice * change
        }
        
        const newTotalPrice = event.totalPrice + priceChange

        return {
          ...event,
          quantities: newQuantities,
          totalPrice: newTotalPrice
        }
      }
      return event
    })

    setLocalEvents(updatedEvents)
    if (onQuantityChange) {
      onQuantityChange(updatedEvents)
    }
  }

  const handleAlbumQuantityChange = (albumIndex, change) => {
    const updatedEvents = localEvents.map(event => {
      if (event.eventType === 'album' && event.albums) {
        const currentAlbum = event.albums[albumIndex]
        const newQty = currentAlbum.quantity + change

        let updatedAlbums
        if (newQty < 1) {
          // Remove the album if quantity goes below 1
          updatedAlbums = event.albums.filter((_, idx) => idx !== albumIndex)
        } else {
          // Update quantity
          updatedAlbums = event.albums.map((album, idx) => 
            idx === albumIndex ? { ...album, quantity: newQty } : album
          )
        }

        // Recalculate total price
        let newTotalPrice = 0
        updatedAlbums.forEach(album => {
          newTotalPrice += album.price * album.quantity
        })

        return {
          ...event,
          albums: updatedAlbums,
          totalPrice: newTotalPrice
        }
      }
      return event
    })

    setLocalEvents(updatedEvents)
    if (onQuantityChange) {
      onQuantityChange(updatedEvents)
    }
  }

  const handleShareToODS = () => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    
    // Capture clientName outside the async callback
    const currentClientName = clientName
    
    script.onload = () => {
      const { jsPDF } = window.jspdf
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pageWidth = 210
      const pageHeight = 297
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      let y = margin
      
      // Gold color: #d4a574
      const goldColor = [212, 165, 116]
      const blackColor = [0, 0, 0]
      const darkGrayColor = [50, 50, 50]
      const lightGrayColor = [240, 240, 240]
      
      // Helper to check and add new page
      const checkNewPage = (minSpace = 30) => {
        if (y + minSpace > pageHeight - margin) {
          pdf.addPage()
          y = margin
        }
      }
      
      // Convert image to base64 for PDF embedding
      const img = new Image()
      img.onload = () => {
        const circularLogo = makeCircularImage(img)

        // HEADER - White background with black text
        // Add round ODS Logo on the right side
        pdf.addImage(circularLogo, 'PNG', pageWidth - margin - 24, 6, 24, 24)

        pdf.setTextColor(...goldColor)
        pdf.setFontSize(28)
        pdf.setFont(undefined, 'bold')
        pdf.text('ONEDAYSTORIES', margin, 18)
        
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(10)
        pdf.setFont(undefined, 'normal')
        pdf.text(getQuoteSubtitle(), margin, 28)
        
        // Add horizontal line below header with gold color
        pdf.setDrawColor(...goldColor)
        pdf.setLineWidth(0.5)
        pdf.line(0, 35, pageWidth, 35)
        
        y = 50
        
        // Generated date
        pdf.setTextColor(...darkGrayColor)
        pdf.setFontSize(9)
        pdf.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, y)
        y += 12
        
        // EVENTS
        localEvents.forEach((event, eventIdx) => {
          checkNewPage(40)
          
          // Event title with background
          pdf.setFillColor(...goldColor)
          pdf.rect(margin, y, contentWidth, 8, 'F')
          
          pdf.setTextColor(0, 0, 0)
          pdf.setFontSize(12)
          pdf.setFont(undefined, 'bold')
          pdf.text(getEventTitle(event.eventType, event.eventName), margin + 4, y + 6)
          
          y += 12
          
          // For pre-wedding/post-wedding: display duration between event title and table header
          const isPreOrPostWedding = event.eventType === 'pre-wedding' || event.eventType === 'post-wedding'
          if (isPreOrPostWedding) {
            // Calculate duration price
            const services = event.services || []
            const sortedServices = getSortedServices([...services])
            let extraChargesTotal = 0
            sortedServices.forEach(serviceId => {
              const qty = getServiceQuantity(event, serviceId)
              if (qty > 1) {
                const unitPrice = getServicePrice(serviceId)
                extraChargesTotal += unitPrice * (qty - 1)
              }
            })
            
            const durationPrice = event.totalPrice - extraChargesTotal
            const durationName = durationPrice === 40000 ? '2 Days' : '1 Day'
            
            pdf.setTextColor(...darkGrayColor)
            pdf.setFont(undefined, 'normal')
            pdf.setFontSize(9)
            
            // Center the duration text both horizontally and vertically
            const centerY = y + 3.5  // Vertically center in the space
            pdf.text(`Duration: ${durationName} - Rs. ${durationPrice.toLocaleString()}`, pageWidth / 2, centerY, { align: 'center' })
            
            y += 7
          }
          
          // Table header
          const colWidths = [80, 35, 15, 10, 50]
          const headerY = y
          
          pdf.setFillColor(...lightGrayColor)
          pdf.rect(margin, y, contentWidth, 7, 'F')
          
          pdf.setTextColor(...blackColor)
          pdf.setFontSize(9)
          pdf.setFont(undefined, 'bold')
          
          let colX = margin + 2
          pdf.text('Item', colX, y + 5)
          colX += colWidths[0]
          pdf.text('Unit Price', colX, y + 5)
          colX += colWidths[1]
          pdf.text('Qty', colX, y + 5, { align: 'center' })
          colX += colWidths[2]
          colX += colWidths[3]
          pdf.text('Total', colX, y + 5)
          
          y += 9
          
          // Table rows
          pdf.setFont(undefined, 'normal')
          pdf.setFontSize(9)
          
          if (event.eventType === 'album' && event.albums && event.albums.length > 0) {
            event.albums.forEach((album, albumIdx) => {
              checkNewPage(15)
              
              pdf.setTextColor(...blackColor)
              
              // Row background alternating
              if (albumIdx % 2 === 0) {
                pdf.setFillColor(255, 255, 255)
                pdf.rect(margin, y - 1, contentWidth, 7, 'F')
              }
              
              colX = margin + 2
              const itemName = `${album.title} (${album.sheets})`
              pdf.text(itemName, colX, y + 2)
              
              colX += colWidths[0]
              pdf.text(`Rs. ${album.price.toLocaleString()}`, colX, y + 2)
              
              colX += colWidths[1]
              pdf.text(album.quantity.toString(), colX, y + 2, { align: 'center' })
              
              colX += colWidths[2]
              colX += colWidths[3]
              pdf.text(`Rs. ${(album.price * album.quantity).toLocaleString()}`, colX, y + 2)
              
              y += 7
              
              // Notes below item if present
              if (album.notes) {
                pdf.setTextColor(212, 165, 116)
                pdf.setFontSize(8)
                pdf.setFont(undefined, 'italic')
                const noteLines = pdf.splitTextToSize(`Note: ${album.notes}`, contentWidth - 4)
                noteLines.forEach(line => {
                  pdf.text(line, margin + 4, y)
                  y += 4
                })
                y += 2
              }
            })
          } else if (event.services && event.services.length > 0) {
            const sortedServices = getSortedServices([...event.services])
            const isPreOrPostWedding = event.eventType === 'pre-wedding' || event.eventType === 'post-wedding'
            
            sortedServices.forEach((service, serviceIdx) => {
              checkNewPage(12)
              
              pdf.setTextColor(...blackColor)
              pdf.setFont(undefined, 'normal')
              pdf.setFontSize(9)
              
              // Row background alternating
              if (serviceIdx % 2 === 0) {
                pdf.setFillColor(255, 255, 255)
                pdf.rect(margin, y - 1, contentWidth, 7, 'F')
              }
              
              const qty = getServiceQuantity(event, service)
              const unitPrice = getServicePrice(service)
              const serviceName = getServiceName(service)
              
              colX = margin + 2
              pdf.text(serviceName, colX, y + 2)
              
              colX += colWidths[0]
              
              // For pre-wedding/post-wedding: show "-" in unit price column
              if (isPreOrPostWedding) {
                pdf.text('-', colX, y + 2)
              } else {
                pdf.text(`Rs. ${unitPrice.toLocaleString()}`, colX, y + 2)
              }
              
              colX += colWidths[1]
              pdf.text(qty.toString(), colX, y + 2, { align: 'center' })
              
              colX += colWidths[2]
              colX += colWidths[3]
              
              // For pre-wedding/post-wedding: show "-" in total column
              // Individual items are included in the duration package
              if (isPreOrPostWedding) {
                pdf.text('-', colX, y + 2)
              } else {
                // For other events: show the total price
                const total = unitPrice * qty
                pdf.text(`Rs. ${total.toLocaleString()}`, colX, y + 2)
              }
              
              y += 7
            })
            
            // For pre-wedding/post-wedding: show extra charges separately below services
            if (isPreOrPostWedding) {
              const extraCharges = getExtraServiceChargeDetails(event)
              if (extraCharges && extraCharges.length > 0) {
                y += 5
                pdf.setTextColor(212, 165, 116)
                pdf.setFontSize(8)
                pdf.setFont(undefined, 'normal')
                pdf.text('Extra Service Charges:', margin + 2, y)
                y += 5
                
                extraCharges.forEach((charge, chargeIdx) => {
                  checkNewPage(8)
                  
                  pdf.setTextColor(...blackColor)
                  pdf.setFontSize(8)
                  
                  colX = margin + 4
                  const chargeText = `+ ${charge.serviceName}: (${charge.extraQuantity}) × Rs. ${charge.unitPrice.toLocaleString()}`
                  pdf.text(chargeText, colX, y)
                  
                  colX = pageWidth - margin - 50
                  pdf.text(`Rs. ${charge.extraCharge.toLocaleString()}`, colX, y)
                  
                  y += 5
                })
              }
            }
          }
          
          // Event total line
          y += 3
          pdf.setDrawColor(...goldColor)
          pdf.setLineWidth(0.5)
          pdf.line(margin, y, pageWidth - margin, y)
          
          y += 5
          pdf.setTextColor(...darkGrayColor)
          pdf.setFont(undefined, 'normal')
          pdf.setFontSize(8)
          pdf.text('Event Total:', margin + 2, y)
          
          pdf.setTextColor(...goldColor)
          pdf.setFont(undefined, 'bold')
          const eventTotalText = `Rs. ${event.totalPrice.toLocaleString()}`
          const eventTotalX = pageWidth - margin - 20
          pdf.text(eventTotalText, eventTotalX, y)
          
          y += 9
        })

        // ADDITIONAL DELIVERABLES (manually added custom items)
        if (customDeliverables.length > 0) {
          checkNewPage(40)

          pdf.setFillColor(...goldColor)
          pdf.rect(margin, y, contentWidth, 8, 'F')
          pdf.setTextColor(0, 0, 0)
          pdf.setFontSize(12)
          pdf.setFont(undefined, 'bold')
          pdf.text('Additional Deliverables', margin + 4, y + 6)
          y += 12

          const addColWidths = [80, 35, 15, 10, 50]
          pdf.setFillColor(...lightGrayColor)
          pdf.rect(margin, y, contentWidth, 7, 'F')
          pdf.setTextColor(...blackColor)
          pdf.setFontSize(9)
          pdf.setFont(undefined, 'bold')
          let addColX = margin + 2
          pdf.text('Item', addColX, y + 5)
          addColX += addColWidths[0]
          pdf.text('Unit Price', addColX, y + 5)
          addColX += addColWidths[1]
          pdf.text('Qty', addColX, y + 5, { align: 'center' })
          addColX += addColWidths[2]
          addColX += addColWidths[3]
          pdf.text('Total', addColX, y + 5)
          y += 9

          pdf.setFont(undefined, 'normal')
          pdf.setFontSize(9)
          let additionalTotal = 0
          customDeliverables.forEach((item, itemIdx) => {
            checkNewPage(12)
            pdf.setTextColor(...blackColor)
            if (itemIdx % 2 === 0) {
              pdf.setFillColor(255, 255, 255)
              pdf.rect(margin, y - 1, contentWidth, 7, 'F')
            }
            const lineTotal = item.price * item.quantity
            additionalTotal += lineTotal
            addColX = margin + 2
            pdf.text(item.title, addColX, y + 2)
            addColX += addColWidths[0]
            pdf.text(`Rs. ${item.price.toLocaleString()}`, addColX, y + 2)
            addColX += addColWidths[1]
            pdf.text(item.quantity.toString(), addColX, y + 2, { align: 'center' })
            addColX += addColWidths[2]
            addColX += addColWidths[3]
            pdf.text(`Rs. ${lineTotal.toLocaleString()}`, addColX, y + 2)
            y += 7
          })

          y += 3
          pdf.setDrawColor(...goldColor)
          pdf.setLineWidth(0.5)
          pdf.line(margin, y, pageWidth - margin, y)
          y += 5
          pdf.setTextColor(...darkGrayColor)
          pdf.setFont(undefined, 'normal')
          pdf.setFontSize(8)
          pdf.text('Section Total:', margin + 2, y)
          pdf.setTextColor(...goldColor)
          pdf.setFont(undefined, 'bold')
          pdf.text(`Rs. ${additionalTotal.toLocaleString()}`, pageWidth - margin - 20, y)
          y += 9
        }

        // GRAND TOTAL
        checkNewPage(30)

        y += 8
        pdf.setDrawColor(...goldColor)
        pdf.setLineWidth(1)
        pdf.line(margin, y, pageWidth - margin, y)

        y += 12
        pdf.setTextColor(...blackColor)
        pdf.setFont(undefined, 'bold')
        pdf.setFontSize(11)

        const totalLabel = `Total Budget (${getEventsCountLabel()})`
        const totalAmount = `Rs. ${calculateTotalBudget().toLocaleString()}`
        
        pdf.text(totalLabel, margin + 5, y)
        
        pdf.setTextColor(...goldColor)
        pdf.setFont(undefined, 'bold')
        pdf.setFontSize(16)
        const totalAmountX = pageWidth - margin - 5
        pdf.text(totalAmount, totalAmountX, y, { align: 'right' })

        // DELIVERABLES SUMMARY (what the client finally receives)
        renderDeliverablesSection(pdf, { pageWidth, pageHeight, margin, contentWidth, goldColor, darkGrayColor })

        // TERMS & CONDITIONS
        renderTermsAndConditions(pdf, { pageWidth, pageHeight, margin, contentWidth, goldColor, darkGrayColor })

        // FOOTER
        y = pageHeight - margin - 12
        pdf.setTextColor(...darkGrayColor)
        pdf.setFontSize(8)
        pdf.setFont(undefined, 'normal')
        
        pdf.setDrawColor(212, 165, 116)
        pdf.setLineWidth(0.5)
        pdf.line(margin, y, pageWidth - margin, y)
        
        y += 6
        pdf.text('Thank you for choosing One Day Stories!', pageWidth / 2, y, { align: 'center' })
        
        y += 4
        pdf.setTextColor(150, 150, 150)
        pdf.setFontSize(7)
        pdf.text('This quote is valid for 30 days from the date of generation.', pageWidth / 2, y, { align: 'center' })
        
        // Faint logo watermark on every page
        addLogoWatermark(pdf, circularLogo, pageWidth, pageHeight)

        // Download PDF with client name
        const fileName = currentClientName.trim()
          ? `${currentClientName}_${getQuoteSubtitle().replace(/\s+/g, '')}.pdf`
          : `ODS_Quote_${new Date().getTime()}.pdf`
        pdf.save(fileName)
        
        // Open WhatsApp after a brief delay
        setTimeout(() => {
          const phoneNumber = '79933 74334'.replace(/\s+/g, '')
          const message = encodeURIComponent(
            `Hello! 🎉\n\nI have generated a photography quote for you. Please find the PDF attached.\n\nQuote Details:\n• Total Budget: Rs. ${calculateTotalBudget().toLocaleString()}\n• Number of Events: ${localEvents.length}\n• Generated: ${new Date().toLocaleDateString()}\n\nPlease review and let me know if you have any questions.`
          )
          
          const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
          window.open(whatsappUrl, '_blank')
        }, 500)
      }
      img.src = odsLogo
    }
    
    script.onerror = () => {
      alert('Error loading PDF library. Please try again.')
    }
    
    document.head.appendChild(script)
  }

  const getQuoteSubtitle = () => {
    const primaryEvent = localEvents[0]
    if (!primaryEvent) return 'Professional Photography Quote'
    
    if (primaryEvent.eventType === 'other-events' && primaryEvent.eventName) {
      return `${primaryEvent.eventName} Quote`
    }
    
    const subtitles = {
      'wedding': 'Wedding Quote',
      'pre-wedding': 'Pre-Wedding Quote',
      'post-wedding': 'Post-Wedding Quote',
      'engagement': 'Engagement Quote',
      'birthday': 'Birthday Quote',
      'pre-birthday': 'Pre-Birthday Quote',
      'maternity': 'Maternity Quote'
    }
    
    return subtitles[primaryEvent.eventType] || 'Professional Photography Quote'
  }

  const getSortedServices = (services) => {
    const serviceOrder = ['traditional-photo', 'traditional-video', 'candid-photo', 'candid-video', 'drone', 'audience-video']
    return services.sort((a, b) => {
      const indexA = serviceOrder.indexOf(a)
      const indexB = serviceOrder.indexOf(b)
      return (indexA === -1 ? serviceOrder.length : indexA) - (indexB === -1 ? serviceOrder.length : indexB)
    })
  }

  const getExtraServiceChargeDetails = (event) => {
    // Only for pre-wedding and post-wedding events
    if (event.eventType !== 'pre-wedding' && event.eventType !== 'post-wedding') {
      return null
    }

    const extraCharges = []
    if (event.services && event.services.length > 0) {
      event.services.forEach(serviceId => {
        const quantity = getServiceQuantity(event, serviceId)
        if (quantity > 1) {
          const unitPrice = getServicePrice(serviceId)
          const extraQuantity = quantity - 1
          const extraCharge = unitPrice * extraQuantity
          const serviceName = getServiceName(serviceId)
          extraCharges.push({
            serviceName,
            unitPrice,
            extraQuantity,
            extraCharge
          })
        }
      })
    }

    return extraCharges.length > 0 ? extraCharges : null
  }

  const handleDownloadQuote = () => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    
    // Capture clientName outside the async callback
    const currentClientName = clientName
    
    script.onload = () => {
      const { jsPDF } = window.jspdf
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pageWidth = 210
      const pageHeight = 297
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      let y = margin
      
      // Gold color: #d4a574
      const goldColor = [212, 165, 116]
      const blackColor = [0, 0, 0]
      const darkGrayColor = [50, 50, 50]
      const lightGrayColor = [240, 240, 240]
      
      // Helper to check and add new page
      const checkNewPage = (minSpace = 30) => {
        if (y + minSpace > pageHeight - margin) {
          pdf.addPage()
          y = margin
        }
      }
      
      // HEADER - White background with black text
      // No background fill, just text and logo
      
      // Convert image to base64 for PDF embedding. The content below is drawn
      // synchronously first; this onload fires afterwards, so by the time it runs
      // every page exists — we stamp the watermark, add the header logo, then save.
      const img = new Image()
      img.onload = () => {
        const circularLogo = makeCircularImage(img)

        // Faint logo watermark on every page
        addLogoWatermark(pdf, circularLogo, pageWidth, pageHeight)

        // Add round ODS Logo on the right side of the first page
        pdf.setPage(1)
        pdf.addImage(circularLogo, 'PNG', pageWidth - margin - 24, 6, 24, 24)

        // Save with client name
        const fileName = currentClientName.trim()
          ? `${currentClientName}_${getQuoteSubtitle().replace(/\s+/g, '')}.pdf`
          : `ODS_Quote_${new Date().getTime()}.pdf`
        pdf.save(fileName)
      }
      img.src = odsLogo

      pdf.setTextColor(...goldColor)
      pdf.setFontSize(28)
      pdf.setFont(undefined, 'bold')
      pdf.text('ONEDAYSTORIES', margin, 18)
      
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      pdf.setFont(undefined, 'normal')
      pdf.text(getQuoteSubtitle(), margin, 28)
      
      // Add horizontal line below header with gold color
      pdf.setDrawColor(...goldColor)
      pdf.setLineWidth(0.5)
      pdf.line(0, 35, pageWidth, 35)
      
      y = 50
      
      // Generated date
      pdf.setTextColor(...darkGrayColor)
      pdf.setFontSize(9)
      pdf.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, y)
      y += 12
      
      // EVENTS
      localEvents.forEach((event, eventIdx) => {
        checkNewPage(40)
        
        // Event title with background
        pdf.setFillColor(...goldColor)
        pdf.rect(margin, y, contentWidth, 8, 'F')
        
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(12)
        pdf.setFont(undefined, 'bold')
        pdf.text(getEventTitle(event.eventType, event.eventName), margin + 4, y + 6)
        
        y += 12
        
        // For pre-wedding/post-wedding: display duration between event title and table header
        const isPreOrPostWedding2 = event.eventType === 'pre-wedding' || event.eventType === 'post-wedding'
        if (isPreOrPostWedding2) {
          // Calculate duration price
          const services2 = event.services || []
          const sortedServices2 = getSortedServices([...services2])
          let extraChargesTotal2 = 0
          sortedServices2.forEach(serviceId => {
            const qty = getServiceQuantity(event, serviceId)
            if (qty > 1) {
              const unitPrice = getServicePrice(serviceId)
              extraChargesTotal2 += unitPrice * (qty - 1)
            }
          })
          
          const durationPrice2 = event.totalPrice - extraChargesTotal2
          const durationName2 = durationPrice2 === 40000 ? '2 Days' : '1 Day'
          
          pdf.setTextColor(...darkGrayColor)
          pdf.setFont(undefined, 'normal')
          pdf.setFontSize(9)
          
          // Center the duration text both horizontally and vertically
          const centerY2 = y + 3.5  // Vertically center in the space
          pdf.text(`Duration: ${durationName2} - Rs. ${durationPrice2.toLocaleString()}`, pageWidth / 2, centerY2, { align: 'center' })
          
          y += 7
        }
        
        // Table header
        const colWidths = [80, 35, 15, 10, 50]
        const headerY = y
        
        pdf.setFillColor(...lightGrayColor)
        pdf.rect(margin, y, contentWidth, 7, 'F')
        
        pdf.setTextColor(...blackColor)
        pdf.setFontSize(9)
        pdf.setFont(undefined, 'bold')
        
        let colX = margin + 2
        pdf.text('Item', colX, y + 5)
        colX += colWidths[0]
        pdf.text('Unit Price', colX, y + 5)
        colX += colWidths[1]
        pdf.text('Qty', colX, y + 5, { align: 'center' })
        colX += colWidths[2]
        colX += colWidths[3]
        pdf.text('Total', colX, y + 5)
        
        y += 9
        
        // Table rows
        pdf.setFont(undefined, 'normal')
        pdf.setFontSize(9)
        
        if (event.eventType === 'album' && event.albums && event.albums.length > 0) {
          event.albums.forEach((album, albumIdx) => {
            checkNewPage(15)
            
            pdf.setTextColor(...blackColor)
            
            // Row background alternating
            if (albumIdx % 2 === 0) {
              pdf.setFillColor(255, 255, 255)
              pdf.rect(margin, y - 1, contentWidth, 7, 'F')
            }
            
            colX = margin + 2
            const itemName = `${album.title} (${album.sheets})`
            pdf.text(itemName, colX, y + 2)
            
            colX += colWidths[0]
            pdf.text(`Rs. ${album.price.toLocaleString()}`, colX, y + 2)
            
            colX += colWidths[1]
            pdf.text(album.quantity.toString(), colX, y + 2, { align: 'center' })
            
            colX += colWidths[2]
            colX += colWidths[3]
            pdf.text(`Rs. ${(album.price * album.quantity).toLocaleString()}`, colX, y + 2)
            
            y += 7
            
            // Notes below item if present
            if (album.notes) {
              pdf.setTextColor(212, 165, 116)
              pdf.setFontSize(8)
              pdf.setFont(undefined, 'italic')
              const noteLines = pdf.splitTextToSize(`Note: ${album.notes}`, contentWidth - 4)
              noteLines.forEach(line => {
                pdf.text(line, margin + 4, y)
                y += 4
              })
              y += 2
            }
          })
        } else if (event.services && event.services.length > 0) {
          const sortedServices = getSortedServices([...event.services])
          const isPreOrPostWedding = event.eventType === 'pre-wedding' || event.eventType === 'post-wedding'
          
          sortedServices.forEach((service, serviceIdx) => {
            checkNewPage(12)
            
            pdf.setTextColor(...blackColor)
            pdf.setFont(undefined, 'normal')
            pdf.setFontSize(9)
            
            // Row background alternating
            if (serviceIdx % 2 === 0) {
              pdf.setFillColor(255, 255, 255)
              pdf.rect(margin, y - 1, contentWidth, 7, 'F')
            }
            
            const qty = getServiceQuantity(event, service)
            const unitPrice = getServicePrice(service)
            const serviceName = getServiceName(service)
            
            colX = margin + 2
            pdf.text(serviceName, colX, y + 2)
            
            colX += colWidths[0]
            
            // For pre-wedding/post-wedding: show "-" in unit price column
            if (isPreOrPostWedding) {
              pdf.text('-', colX, y + 2)
            } else {
              pdf.text(`Rs. ${unitPrice.toLocaleString()}`, colX, y + 2)
            }
            
            colX += colWidths[1]
            pdf.text(qty.toString(), colX, y + 2, { align: 'center' })
            
            colX += colWidths[2]
            colX += colWidths[3]
            
            // For pre-wedding/post-wedding: show "-" in total column
            // Individual items are included in the duration package
            if (isPreOrPostWedding) {
              pdf.text('-', colX, y + 2)
            } else {
              // For other events: show the total price
              const total = unitPrice * qty
              pdf.text(`Rs. ${total.toLocaleString()}`, colX, y + 2)
            }
            
            y += 7
          })
          
          // For pre-wedding/post-wedding: show extra charges separately below services
          if (isPreOrPostWedding) {
            const extraCharges = getExtraServiceChargeDetails(event)
            if (extraCharges && extraCharges.length > 0) {
              y += 5
              pdf.setTextColor(212, 165, 116)
              pdf.setFontSize(8)
              pdf.setFont(undefined, 'normal')
              pdf.text('Extra Service Charges:', margin + 2, y)
              y += 5
              
              extraCharges.forEach((charge, chargeIdx) => {
                checkNewPage(8)
                
                pdf.setTextColor(...blackColor)
                pdf.setFontSize(8)
                
                colX = margin + 4
                const chargeText = `+ ${charge.serviceName}: (${charge.extraQuantity}) × Rs. ${charge.unitPrice.toLocaleString()}`
                pdf.text(chargeText, colX, y)
                
                colX = pageWidth - margin - 50
                pdf.text(`Rs. ${charge.extraCharge.toLocaleString()}`, colX, y)
                
                y += 5
              })
            }
          }
        }
        
        // Event total line
        y += 3
        pdf.setDrawColor(...goldColor)
        pdf.setLineWidth(0.5)
        pdf.line(margin, y, pageWidth - margin, y)
        
        y += 5
        pdf.setTextColor(...darkGrayColor)
        pdf.setFont(undefined, 'normal')
        pdf.setFontSize(8)
        pdf.text('Event Total:', margin + 2, y)
        
        pdf.setTextColor(...goldColor)
        pdf.setFont(undefined, 'bold')
        const eventTotalText = `Rs. ${event.totalPrice.toLocaleString()}`
        // Position amount well inside the margin - use left align with margin buffer
        const eventTotalX = pageWidth - margin - 20
        pdf.text(eventTotalText, eventTotalX, y)
        
        y += 9
      })

      // ADDITIONAL DELIVERABLES (manually added custom items)
      if (customDeliverables.length > 0) {
        checkNewPage(40)

        pdf.setFillColor(...goldColor)
        pdf.rect(margin, y, contentWidth, 8, 'F')
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(12)
        pdf.setFont(undefined, 'bold')
        pdf.text('Additional Deliverables', margin + 4, y + 6)
        y += 12

        const addColWidths = [80, 35, 15, 10, 50]
        pdf.setFillColor(...lightGrayColor)
        pdf.rect(margin, y, contentWidth, 7, 'F')
        pdf.setTextColor(...blackColor)
        pdf.setFontSize(9)
        pdf.setFont(undefined, 'bold')
        let addColX = margin + 2
        pdf.text('Item', addColX, y + 5)
        addColX += addColWidths[0]
        pdf.text('Unit Price', addColX, y + 5)
        addColX += addColWidths[1]
        pdf.text('Qty', addColX, y + 5, { align: 'center' })
        addColX += addColWidths[2]
        addColX += addColWidths[3]
        pdf.text('Total', addColX, y + 5)
        y += 9

        pdf.setFont(undefined, 'normal')
        pdf.setFontSize(9)
        let additionalTotal = 0
        customDeliverables.forEach((item, itemIdx) => {
          checkNewPage(12)
          pdf.setTextColor(...blackColor)
          if (itemIdx % 2 === 0) {
            pdf.setFillColor(255, 255, 255)
            pdf.rect(margin, y - 1, contentWidth, 7, 'F')
          }
          const lineTotal = item.price * item.quantity
          additionalTotal += lineTotal
          addColX = margin + 2
          pdf.text(item.title, addColX, y + 2)
          addColX += addColWidths[0]
          pdf.text(`Rs. ${item.price.toLocaleString()}`, addColX, y + 2)
          addColX += addColWidths[1]
          pdf.text(item.quantity.toString(), addColX, y + 2, { align: 'center' })
          addColX += addColWidths[2]
          addColX += addColWidths[3]
          pdf.text(`Rs. ${lineTotal.toLocaleString()}`, addColX, y + 2)
          y += 7
        })

        y += 3
        pdf.setDrawColor(...goldColor)
        pdf.setLineWidth(0.5)
        pdf.line(margin, y, pageWidth - margin, y)
        y += 5
        pdf.setTextColor(...darkGrayColor)
        pdf.setFont(undefined, 'normal')
        pdf.setFontSize(8)
        pdf.text('Section Total:', margin + 2, y)
        pdf.setTextColor(...goldColor)
        pdf.setFont(undefined, 'bold')
        pdf.text(`Rs. ${additionalTotal.toLocaleString()}`, pageWidth - margin - 20, y)
        y += 9
      }

      // GRAND TOTAL
      checkNewPage(30)

      y += 8
      pdf.setDrawColor(...goldColor)
      pdf.setLineWidth(1)
      pdf.line(margin, y, pageWidth - margin, y)

      y += 12
      pdf.setTextColor(...blackColor)
      pdf.setFont(undefined, 'bold')
      pdf.setFontSize(11)

      const totalLabel = `Total Budget (${getEventsCountLabel()})`
      const totalAmount = `Rs. ${calculateTotalBudget().toLocaleString()}`
      
      // Draw label on left
      pdf.text(totalLabel, margin + 5, y)
      
      // Draw amount on right with right alignment and proper margin buffer
      pdf.setTextColor(...goldColor)
      pdf.setFont(undefined, 'bold')
      pdf.setFontSize(16)
      const totalAmountX = pageWidth - margin - 5
      pdf.text(totalAmount, totalAmountX, y, { align: 'right' })

      // DELIVERABLES SUMMARY (what the client finally receives)
      renderDeliverablesSection(pdf, { pageWidth, pageHeight, margin, contentWidth, goldColor, darkGrayColor })

      // TERMS & CONDITIONS
      renderTermsAndConditions(pdf, { pageWidth, pageHeight, margin, contentWidth, goldColor, darkGrayColor })

      // FOOTER
      y = pageHeight - margin - 12
      pdf.setTextColor(...darkGrayColor)
      pdf.setFontSize(8)
      pdf.setFont(undefined, 'normal')
      
      pdf.setDrawColor(212, 165, 116)
      pdf.setLineWidth(0.5)
      pdf.line(margin, y, pageWidth - margin, y)
      
      y += 6
      pdf.text('Thank you for choosing One Day Stories!', pageWidth / 2, y, { align: 'center' })
      
      y += 4
      pdf.setTextColor(150, 150, 150)
      pdf.setFontSize(7)
      pdf.text('This quote is valid for 30 days from the date of generation.', pageWidth / 2, y, { align: 'center' })

      // The PDF is saved inside img.onload (above), once the logo is loaded and
      // the watermark has been stamped on every page.
    }

    script.onerror = () => {
      alert('Error loading PDF library. Please try again.')
    }

    document.head.appendChild(script)
  }

  const getCustomDeliverablesTotal = () => {
    return customDeliverables.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const calculateTotalBudget = () => {
    const eventsTotal = localEvents.reduce((total, event) => total + event.totalPrice, 0)
    return eventsTotal + getCustomDeliverablesTotal()
  }

  // Count label for the Total Budget: real events plus a separate album count
  // (albums are not counted as events)
  const getEventsCountLabel = () => {
    const eventCount = localEvents.filter(e => e.eventType !== 'album').length
    const albumCount = localEvents
      .filter(e => e.eventType === 'album')
      .reduce((sum, e) => sum + (Array.isArray(e.albums) ? e.albums.length : 1), 0)

    let label = `${eventCount} ${eventCount === 1 ? 'Event' : 'Events'}`
    if (albumCount > 0) {
      label += ` + ${albumCount} ${albumCount === 1 ? 'Album' : 'Albums'}`
    }
    return label
  }

  // Videos grouped by type (for the deliverables summary): each video type lists the
  // names of the events that selected it, shown side by side.
  const VIDEO_TYPES = [
    { id: 'traditional-video', heading: 'Regular Videos' },
    { id: 'candid-video', heading: 'Candid Videos' },
    { id: 'audience-video', heading: 'Audience Videos' }
  ]
  const videoDeliverablesByType = VIDEO_TYPES
    .map(type => ({
      heading: type.heading,
      events: localEvents
        .filter(event => event.eventType !== 'album' && Array.isArray(event.services) && event.services.includes(type.id))
        .map(event => getEventTitle(event.eventType, event.eventName))
    }))
    .filter(group => group.events.length > 0)

  // Albums shown at the end of the deliverables list
  const albumDeliverables = localEvents
    .filter(event => event.eventType === 'album' && Array.isArray(event.albums))
    .flatMap(event => event.albums)

  // Returns a circular (round) version of the logo as a transparent PNG data URL,
  // by cropping the image to a centered square and clipping it to a circle.
  const makeCircularImage = (img) => {
    const size = Math.min(img.width, img.height)
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    const sx = (img.width - size) / 2
    const sy = (img.height - size) / 2
    ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size)
    return canvas.toDataURL('image/png')
  }

  // Stamps the ODS logo as a faint, transparent watermark centered on every page.
  // Call this after all content/pages have been drawn, right before saving.
  const addLogoWatermark = (pdf, logoData, pageWidth, pageHeight) => {
    const totalPages = pdf.getNumberOfPages()
    const supportsOpacity = typeof pdf.GState === 'function'

    // Centered round watermark (transparent corners), smaller than the page
    const size = 110 // mm — diameter of the round watermark
    const x = (pageWidth - size) / 2
    const y = (pageHeight - size) / 2

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      if (supportsOpacity) {
        pdf.setGState(new pdf.GState({ opacity: 0.12 }))
      }
      pdf.addImage(logoData, 'PNG', x, y, size, size)
      if (supportsOpacity) {
        pdf.setGState(new pdf.GState({ opacity: 1 }))
      }
    }
  }

  // Renders the "what you finally receive" summary on a fresh page at the end of the PDF.
  // Videos are grouped by type (event names side by side); albums and additional
  // deliverables are shown as a quantity table.
  const renderDeliverablesSection = (pdf, layout) => {
    const { pageHeight, margin, contentWidth, goldColor, darkGrayColor } = layout
    const blackColor = [0, 0, 0]
    const lightGrayColor = [240, 240, 240]
    const borderColor = [210, 210, 210]
    const groupTintColor = [248, 241, 232]

    const hasDeliverables =
      videoDeliverablesByType.length > 0 ||
      albumDeliverables.length > 0 ||
      customDeliverables.length > 0
    if (!hasDeliverables) return

    pdf.addPage()
    let y = margin

    // Section title bar
    pdf.setFillColor(...goldColor)
    pdf.rect(margin, y, contentWidth, 8, 'F')
    pdf.setTextColor(...blackColor)
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'bold')
    pdf.text('Deliverables', margin + 4, y + 6)
    y += 11
    pdf.setTextColor(120, 120, 120)
    pdf.setFontSize(8)
    pdf.setFont(undefined, 'italic')
    pdf.text('What you will finally receive', margin + 2, y)
    y += 8

    // Single table: video types (event names side by side) + albums + additional
    const qtyColWidth = 25
    const itemColWidth = contentWidth - qtyColWidth
    const dividerX = margin + itemColWidth
    const rowH = 8
    const lineGap = 5

    const drawTableHeader = () => {
      pdf.setFillColor(...lightGrayColor)
      pdf.rect(margin, y, contentWidth, rowH, 'F')
      pdf.setDrawColor(...borderColor)
      pdf.setLineWidth(0.2)
      pdf.rect(margin, y, contentWidth, rowH)
      pdf.line(dividerX, y, dividerX, y + rowH)
      pdf.setTextColor(...blackColor)
      pdf.setFont(undefined, 'bold')
      pdf.setFontSize(9)
      pdf.text('Deliverable', margin + 3, y + 5.5)
      pdf.text('Qty', dividerX + qtyColWidth / 2, y + 5.5, { align: 'center' })
      y += rowH
    }

    const checkTablePage = (minSpace = rowH) => {
      if (y + minSpace > pageHeight - margin) {
        pdf.addPage()
        y = margin
        drawTableHeader()
      }
    }

    // Full-width group heading row (e.g. "Regular Videos", "Albums")
    const renderGroupHeadingRow = (title) => {
      checkTablePage(rowH * 2)
      pdf.setFillColor(...groupTintColor)
      pdf.rect(margin, y, contentWidth, rowH, 'F')
      pdf.setDrawColor(...borderColor)
      pdf.setLineWidth(0.2)
      pdf.rect(margin, y, contentWidth, rowH)
      pdf.setTextColor(...goldColor)
      pdf.setFont(undefined, 'bold')
      pdf.setFontSize(9)
      pdf.text(title, margin + 3, y + 5.5)
      y += rowH
    }

    // Full-width row listing event names side by side (wraps onto multiple lines)
    const renderEventNamesRow = (events) => {
      pdf.setFont(undefined, 'normal')
      pdf.setFontSize(9)
      const namesLine = events.join('     •     ')
      const lines = pdf.splitTextToSize(namesLine, contentWidth - 6)
      const rowHeight = Math.max(rowH, 3 + lines.length * lineGap)
      checkTablePage(rowHeight)
      pdf.setDrawColor(...borderColor)
      pdf.setLineWidth(0.2)
      pdf.rect(margin, y, contentWidth, rowHeight)
      pdf.setTextColor(...darkGrayColor)
      let ty = y + 5.5
      lines.forEach(line => {
        pdf.text(line, margin + 3, ty)
        ty += lineGap
      })
      y += rowHeight
    }

    // Qty rows (albums / additional deliverables)
    const renderQtyRows = (items) => {
      pdf.setFont(undefined, 'normal')
      pdf.setFontSize(9)
      items.forEach((item, idx) => {
        checkTablePage(rowH)
        if (idx % 2 === 1) {
          pdf.setFillColor(250, 250, 250)
          pdf.rect(margin, y, contentWidth, rowH, 'F')
        }
        pdf.setDrawColor(...borderColor)
        pdf.setLineWidth(0.2)
        pdf.rect(margin, y, contentWidth, rowH)
        pdf.line(dividerX, y, dividerX, y + rowH)
        pdf.setTextColor(...darkGrayColor)
        const nameLines = pdf.splitTextToSize(item.name, itemColWidth - 6)
        pdf.text(nameLines[0], margin + 3, y + 5.5)
        pdf.text(`${item.quantity}`, dividerX + qtyColWidth / 2, y + 5.5, { align: 'center' })
        y += rowH
      })
    }

    drawTableHeader()

    // Video types as rows inside the table
    videoDeliverablesByType.forEach(group => {
      renderGroupHeadingRow(group.heading)
      renderEventNamesRow(group.events)
    })

    // Albums
    if (albumDeliverables.length > 0) {
      renderGroupHeadingRow('Albums')
      renderQtyRows(albumDeliverables.map(a => ({ name: `${a.title} (${a.sheets})`, quantity: a.quantity })))
    }

    // Additional (manually added) deliverables
    if (customDeliverables.length > 0) {
      renderGroupHeadingRow('Additional Deliverables')
      renderQtyRows(customDeliverables.map(c => ({ name: c.title, quantity: c.quantity })))
    }
  }

  // Renders the Terms & Conditions on a fresh page at the end of the PDF
  const renderTermsAndConditions = (pdf, layout) => {
    const { pageHeight, margin, contentWidth, goldColor } = layout
    const blackColor = [0, 0, 0]
    const darkGrayColor = [50, 50, 50]

    const terms = [
      {
        heading: 'Travel, Food & Accommodation',
        points: [
          'For events outside Rajahmundry, travel, local transport and accommodation will either be arranged by the client or charged as per actuals.',
          'For both outstation and Rajahmundry events, the crew dines along with the guests. A per-diem meal charge will be applicable for each crew member.'
        ]
      }
    ]

    const centerX = margin + contentWidth / 2

    pdf.addPage()
    let y = margin

    // Section title bar (centered title)
    pdf.setFillColor(...goldColor)
    pdf.rect(margin, y, contentWidth, 8, 'F')
    pdf.setTextColor(...blackColor)
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'bold')
    pdf.text('Terms & Conditions', centerX, y + 6, { align: 'center' })
    y += 12
    pdf.setTextColor(120, 120, 120)
    pdf.setFontSize(8)
    pdf.setFont(undefined, 'italic')
    pdf.text('Please review the following before confirming your booking', centerX, y, { align: 'center' })
    y += 12

    const checkPage = (minSpace) => {
      if (y + minSpace > pageHeight - margin) {
        pdf.addPage()
        y = margin
      }
    }

    terms.forEach(term => {
      checkPage(20)

      // Heading (centered, no numbering)
      pdf.setTextColor(...goldColor)
      pdf.setFont(undefined, 'bold')
      pdf.setFontSize(10)
      pdf.text(term.heading, centerX, y, { align: 'center' })
      y += 7

      // Points (centered, no bullets)
      pdf.setTextColor(...darkGrayColor)
      pdf.setFont(undefined, 'normal')
      pdf.setFontSize(9)
      term.points.forEach(point => {
        const lines = pdf.splitTextToSize(point, contentWidth - 20)
        lines.forEach(line => {
          checkPage(6)
          pdf.text(line, centerX, y, { align: 'center' })
          y += 5
        })
        y += 3
      })
      y += 5
    })
  }

  return (
    <div className="quote-summary-container">
      {/* Header */}
      <header className="qs-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          ←
        </button>
        <div className="header-logo">
          <img src={odsLogo} alt="One Day Stories" style={{height: "80%"}} />
        </div>
        <div className="header-spacer"></div>
      </header>

      {/* Main Content */}
      <main className="qs-main">
        {/* Step Indicator */}
        <div className="step-indicator">
          <p className="step-number">FINAL STEP</p>
        </div>

        {/* Title Section */}
        <section className="qs-title-section">
          <h1 className="qs-title">Your Complete Quote</h1>
          <p className="qs-subtitle">
            Here's a detailed breakdown of all your selected events and services
          </p>
          
          
          
          <div className="divider-line"></div>
        </section>

        {/* Events Summary */}
        <section className="qs-events-section">
          <div className={`events-container ${showAllEvents ? 'all-expanded' : ''}`}>
            {localEvents.map((event, index) => (
              <div key={event.eventType}>
                {/* Event Header */}
                <div
                  className="event-header"
                  onClick={() => toggleEventExpanded(event.eventType)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="event-info">
                    <h2 className="event-title">{getEventTitle(event.eventType, event.eventName)}</h2>
                    <p className="services-count">
                      {event.eventType === 'album' 
                        ? `${event.albums && event.albums.length > 0 ? event.albums.length : 1} album${event.albums && event.albums.length !== 1 ? 's' : ''} selected`
                        : `${event.services.length} ${event.services.length === 1 ? 'service' : 'services'} selected`
                      }
                    </p>
                  </div>
                  <div className="event-price-and-toggle">
                    <p className="event-price">₹ {event.totalPrice.toLocaleString()}</p>
                    <button className="expand-btn">
                      {expandedEvent === event.eventType ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {/* Event Details - Expandable */}
                {expandedEvent === event.eventType && (
                  <div className="event-details">
                    {event.eventType === 'album' ? (
                      // Multiple Albums Display
                      <div className="albums-list-summary">
                        {event.albums && event.albums.length > 0 ? (
                          event.albums.map((album, albumIndex) => (
                            <div key={albumIndex} className="album-item-summary">
                              <div className="album-info-summary">
                                {album.notes && (
                                  <span className="note-badge-display-summary">
                                    {album.notes}
                                  </span>
                                )}
                                <div className="album-header-summary">
                                  <span className="album-name-summary">
                                    {album.title} ({album.sheets})
                                  </span>
                                </div>
                                <span className="album-price-summary">
                                  ₹ {album.price.toLocaleString()}
                                </span>
                              </div>
                              <div className="album-qty-controls">
                                <button 
                                  className="qty-btn-edit qty-minus"
                                  onClick={() => handleAlbumQuantityChange(albumIndex, -1)}
                                >
                                  −
                                </button>
                                <span className="qty-edit-value">{album.quantity}</span>
                                <button 
                                  className="qty-btn-edit qty-plus"
                                  onClick={() => handleAlbumQuantityChange(albumIndex, 1)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="album-quantity-section">
                            <span className="album-name">{getAlbumSizeDisplay(event)}</span>
                            <div className="album-qty-controls">
                              <button 
                                className="qty-btn-edit qty-minus"
                                onClick={() => handleAlbumQuantityChange(-1)}
                                disabled={event.quantity <= 1}
                              >
                                −
                              </button>
                              <span className="qty-edit-value">{event.quantity}</span>
                              <button 
                                className="qty-btn-edit qty-plus"
                                onClick={() => handleAlbumQuantityChange(1)}
                              >
                                +
                              </button>
                            </div>
                            <span className="album-price">
                              ₹ {(getServicePrice(event.services[0]) * event.quantity).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Services Quantity Controls
                      <div className="services-list">
                        {event.services.map((service, serviceIndex) => {
                          const quantity = getServiceQuantity(event, service)
                          const unitPrice = getServicePrice(service)
                          const isPreOrPostWedding = event.eventType === 'pre-wedding' || event.eventType === 'post-wedding'
                          return (
                            <div key={serviceIndex} className="service-item-editable">
                              <div className="service-left-section">
                                <span className="service-name">{getServiceName(service)}</span>
                                {!isPreOrPostWedding && (
                                  <span className="service-price-edit">
                                    ₹ {unitPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              
                              {/* Quantity Controls */}
                              <div className="service-qty-controls">
                                <button 
                                  className="qty-btn-edit qty-minus"
                                  onClick={() => handleQuantityChange(event.eventType, service, -1)}
                                  disabled={quantity === 1}
                                  title={quantity === 1 ? "Minimum quantity reached" : "Decrease quantity"}
                                >
                                  −
                                </button>
                                <span className="qty-edit-value">{quantity}</span>
                                <button 
                                  className="qty-btn-edit qty-plus"
                                  onClick={() => handleQuantityChange(event.eventType, service, 1)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Event Total */}
                    {getExtraServiceChargeDetails(event) && (
                      <div className="extra-service-charges">
                        <div className="extra-charges-title">Extra Service Charges:</div>
                        {getExtraServiceChargeDetails(event).map((charge, idx) => (
                          <div key={idx} className="extra-charge-item">
                            <span className="charge-service-name">{charge.serviceName}</span>
                            <span className="charge-details">
                              +{charge.extraQuantity} × ₹ {charge.unitPrice.toLocaleString()} = ₹ {charge.extraCharge.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="event-total">
                      <span className="label">Event Total:</span>
                      <span className="amount">₹ {event.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Divider between events */}
                {index < localEvents.length - 1 && <div className="event-divider"></div>}
              </div>
            ))}
          </div>
          
          {/* Show more/less toggle for mobile */}
          {localEvents.length > 2 && (
            <button
              className="show-all-events-btn"
              onClick={() => setShowAllEvents(!showAllEvents)}
              aria-label={showAllEvents ? 'Show less events' : 'Show all events'}
            >
              {showAllEvents ? '▲ Show Less' : '▼ View All Events'}
            </button>
          )}

          {/* Add Custom Item */}
          <div className="custom-items-card">
            <h3 className="custom-items-title">Add Custom Item</h3>
            <p className="custom-items-subtitle">
              Add anything extra (e.g., LED Walls). It will appear in Deliverables and the total budget.
            </p>

            {customDeliverables.length > 0 && (
              <div className="custom-items-list">
                {customDeliverables.map((item, index) => (
                  <div key={index} className="custom-item-row">
                    <span className="custom-item-name">{item.title}</span>
                    <span className="custom-item-qty">x{item.quantity}</span>
                    <span className="custom-item-price">
                      ₹ {(item.price * item.quantity).toLocaleString()}
                    </span>
                    <button
                      className="custom-item-remove"
                      onClick={() => handleRemoveDeliverable(index)}
                      aria-label="Remove item"
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="deliverable-add-form">
              <input
                type="text"
                className="deliverable-input deliverable-input-title"
                placeholder="Title (e.g., LED Walls)"
                value={newDeliverable.title}
                onChange={(e) => handleNewDeliverableChange('title', e.target.value)}
              />
              <input
                type="number"
                min="1"
                className="deliverable-input deliverable-input-qty"
                placeholder="Qty"
                value={newDeliverable.quantity}
                onChange={(e) => handleNewDeliverableChange('quantity', e.target.value)}
              />
              <input
                type="number"
                min="0"
                className="deliverable-input deliverable-input-price"
                placeholder="Price (₹)"
                value={newDeliverable.price}
                onChange={(e) => handleNewDeliverableChange('price', e.target.value)}
              />
              <button
                className="deliverable-add-btn"
                onClick={handleAddDeliverable}
                disabled={!newDeliverable.title.trim()}
              >
                Add
              </button>
            </div>
          </div>
        </section>

        {/* Grand Total */}
        <section className="qs-grand-total">
          <div className="total-card">
            <div className="total-label-container">
              <p className="total-label">Total Budget</p>
              <p className="events-count">
                {getEventsCountLabel()}
              </p>
            </div>
            <p className="grand-total-price">₹ {calculateTotalBudget().toLocaleString()}</p>
          </div>
        </section>

        {/* Deliverables */}
        <section className="qs-deliverables-section">
          <h2 className="deliverables-title">Deliverables</h2>

          {/* Videos grouped by type - event names side by side */}
          {videoDeliverablesByType.map(group => (
            <div key={group.heading} className="deliverable-group">
              <h3 className="deliverable-group-title">{group.heading}</h3>
              <div className="deliverable-events-row">
                {group.events.map((name, i) => (
                  <span key={i} className="deliverable-event-chip">{name}</span>
                ))}
              </div>
            </div>
          ))}

          {/* Albums at the end */}
          {albumDeliverables.length > 0 && (
            <div className="deliverable-group">
              <h3 className="deliverable-group-title">Albums</h3>
              <div className="deliverable-list">
                {albumDeliverables.map((album, index) => (
                  <div key={index} className="deliverable-item">
                    <span className="deliverable-item-name">{album.title} ({album.sheets})</span>
                    <span className="deliverable-item-qty">x{album.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom (manually added) deliverables */}
          {customDeliverables.length > 0 && (
            <div className="deliverable-group">
              <h3 className="deliverable-group-title">Additional Deliverables</h3>
              <div className="deliverable-list">
                {customDeliverables.map((item, index) => (
                  <div key={index} className="deliverable-item deliverable-item-custom">
                    <span className="deliverable-item-name">{item.title}</span>
                    <span className="deliverable-item-qty">x{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {videoDeliverablesByType.length === 0 && albumDeliverables.length === 0 && customDeliverables.length === 0 && (
            <p className="deliverables-empty">No videos or albums selected yet. Add custom items from the events section above.</p>
          )}
        </section>

        {/* Client Name Input */}
          <div className="client-name-section">
            <label htmlFor="clientName" className="client-name-label">Client Name (for PDF filename):</label>
            <div className="client-name-input-wrapper">
              <input
                id="clientName"
                type="text"
                className="client-name-input"
                placeholder="e.g., Anu's Wedding Quote"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            {clientName.trim() && (
              <p className="client-name-preview">
                PDF will be saved as: <strong>{clientName}_{getQuoteSubtitle().replace(/\s+/g, '')}.pdf</strong>
              </p>
            )}
          </div>

        {/* Action Buttons */}
        <section className="qs-actions">
          <button className="btn-back" onClick={onBack}>
            ← BACK
          </button>
          <button className="btn-download" onClick={handleDownloadQuote}>
            DOWNLOAD QUOTE
          </button>
          <button className="btn-share" onClick={handleShareToODS}>
            SHARE TO ODS TEAM →
          </button>
        </section>
      </main>
    </div>
  )
}

export default QuoteSummary
