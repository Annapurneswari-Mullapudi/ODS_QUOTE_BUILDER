import { useState } from 'react'
import odsLogo from '../../assets/OdsLogo.jpeg'
import './QuoteSummary.css'

const QuoteSummary = ({ quoteData, onBack, onDownload, onQuantityChange }) => {
  const [expandedEvent, setExpandedEvent] = useState(null)
  const [showAllEvents, setShowAllEvents] = useState(false)
  const [localEvents, setLocalEvents] = useState(quoteData.events)
  const [clientName, setClientName] = useState('')

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
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const imgData = canvas.toDataURL('image/jpeg')
        
        // HEADER - White background with black text
        // Add ODS Logo on the right side
        pdf.addImage(imgData, 'JPEG', pageWidth - margin - 22, 7, 18, 18)
        
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
        
        const totalLabel = `Total Budget (${localEvents.length} Event${localEvents.length !== 1 ? 's' : ''})`
        const totalAmount = `Rs. ${calculateTotalBudget().toLocaleString()}`
        
        pdf.text(totalLabel, margin + 5, y)
        
        pdf.setTextColor(...goldColor)
        pdf.setFont(undefined, 'bold')
        pdf.setFontSize(16)
        const totalAmountX = pageWidth - margin - 5
        pdf.text(totalAmount, totalAmountX, y, { align: 'right' })
        
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
      
      // Convert image to base64 for PDF embedding
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const imgData = canvas.toDataURL('image/jpeg')
        
        // Add ODS Logo on the right side
        pdf.addImage(imgData, 'JPEG', pageWidth - margin - 22, 7, 18, 18)
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
      
      const totalLabel = `Total Budget (${localEvents.length} Event${localEvents.length !== 1 ? 's' : ''})`
      const totalAmount = `Rs. ${calculateTotalBudget().toLocaleString()}`
      
      // Draw label on left
      pdf.text(totalLabel, margin + 5, y)
      
      // Draw amount on right with right alignment and proper margin buffer
      pdf.setTextColor(...goldColor)
      pdf.setFont(undefined, 'bold')
      pdf.setFontSize(16)
      const totalAmountX = pageWidth - margin - 5
      pdf.text(totalAmount, totalAmountX, y, { align: 'right' })
      
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
      
      // Save with client name
      const fileName = currentClientName.trim() 
        ? `${currentClientName}_${getQuoteSubtitle().replace(/\s+/g, '')}.pdf`
        : `ODS_Quote_${new Date().getTime()}.pdf`
      pdf.save(fileName)
    }
    
    script.onerror = () => {
      alert('Error loading PDF library. Please try again.')
    }
    
    document.head.appendChild(script)
  }

  const calculateTotalBudget = () => {
    return localEvents.reduce((total, event) => total + event.totalPrice, 0)
  }

  return (
    <div className="quote-summary-container">
      {/* Header */}
      <header className="qs-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          ←
        </button>
        <div className="header-logo">
          <img src={odsLogo} alt="One Day Stories" />
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
        </section>

        {/* Grand Total */}
        <section className="qs-grand-total">
          <div className="total-card">
            <div className="total-label-container">
              <p className="total-label">Total Budget</p>
              <p className="events-count">
                {quoteData.events.length} {quoteData.events.length === 1 ? 'Event' : 'Events'}
              </p>
            </div>
            <p className="grand-total-price">₹ {calculateTotalBudget().toLocaleString()}</p>
          </div>
        </section>

        {/* Client Name Input */}
          <div className="client-name-section">
            <label htmlFor="clientName" className="client-name-label">Client Name (for PDF filename):</label>
            <div className="client-name-input-wrapper">
              <input
                id="clientName"
                type="text"
                className="client-name-input"
                placeholder="e.g., Anu's Wedding"
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
