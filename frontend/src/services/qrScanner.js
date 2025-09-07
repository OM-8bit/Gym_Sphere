import api from './api'

class QRScannerService {
  /**
   * Scan QR code for existing card (access control)
   * @param {string} qrData - The QR code data
   * @returns {Promise} API response
   */
  async scanCardQR(qrData) {
    try {
      const response = await api.post('/api/admin/scan-card-qr', {
        qr_data: qrData
      })
      return response.data
    } catch (error) {
      console.error('QR Scan Error:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Scan QR code for new card registration
   * @param {string} qrData - The QR code data
   * @param {string} memberId - The member ID to associate with the card
   * @returns {Promise} API response
   */
  async scanNewCard(qrData, memberId) {
    try {
      const response = await api.post('/api/admin/scan-new-card', {
        qr_data: qrData,
        member_id: memberId
      })
      return response.data
    } catch (error) {
      console.error('New Card Scan Error:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Validate QR code format and extract information
   * @param {string} qrData - The QR code data
   * @returns {Object} Parsed QR code information
   */
  parseQRCode(qrData) {
    try {
      // GymSphere Card Format: "GYMSPHERE_CARD:{card_id}:{card_type}:{timestamp}"
      if (qrData.startsWith('GYMSPHERE_CARD:')) {
        const parts = qrData.split(':')
        if (parts.length >= 3) {
          return {
            format: 'gymsphere',
            cardId: parts[1],
            cardType: parts[2] || 'standard',
            timestamp: parts[3] || null,
            isValid: true
          }
        }
      }

      // Your Physical QR Format: "gymsphere:ABC002"
      if (qrData.startsWith('gymsphere:')) {
        const cardId = qrData.split(':')[1]
        if (cardId) {
          return {
            format: 'physical_gymsphere',
            cardId: cardId,
            cardType: 'standard',
            timestamp: null,
            isValid: true
          }
        }
      }

      // Generic Card ID Format: Just the card ID
      if (qrData.match(/^[A-Za-z0-9_-]+$/)) {
        return {
          format: 'generic',
          cardId: qrData,
          cardType: 'standard',
          timestamp: null,
          isValid: true
        }
      }

      // URL Format: Extract card ID from URL
      if (qrData.startsWith('http')) {
        const url = new URL(qrData)
        const cardId = url.searchParams.get('card_id') || 
                       url.pathname.split('/').pop()
        
        if (cardId) {
          return {
            format: 'url',
            cardId: cardId,
            cardType: 'standard',
            timestamp: null,
            isValid: true,
            originalUrl: qrData
          }
        }
      }

      // Invalid format
      return {
        format: 'unknown',
        cardId: null,
        cardType: null,
        timestamp: null,
        isValid: false,
        rawData: qrData
      }
    } catch (error) {
      console.error('QR Parse Error:', error)
      return {
        format: 'error',
        cardId: null,
        cardType: null,
        timestamp: null,
        isValid: false,
        rawData: qrData,
        error: error.message
      }
    }
  }

  /**
   * Validate if QR code data is acceptable
   * @param {string} qrData - The QR code data
   * @returns {Object} Validation result
   */
  validateQRCode(qrData) {
    if (!qrData || typeof qrData !== 'string') {
      return {
        isValid: false,
        error: 'QR code data is empty or invalid'
      }
    }

    if (qrData.trim().length === 0) {
      return {
        isValid: false,
        error: 'QR code data is empty'
      }
    }

    const parsed = this.parseQRCode(qrData)
    
    if (!parsed.isValid) {
      return {
        isValid: false,
        error: 'QR code format not recognized. Please use a valid gym card QR code.'
      }
    }

    return {
      isValid: true,
      parsed: parsed
    }
  }

  /**
   * Handle API errors and format them for display
   * @param {Error} error - The error object
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const data = error.response.data
      
      // Handle specific error patterns
      if (data.detail && typeof data.detail === 'object') {
        // Handle Supabase/PostgREST errors
        if (data.detail.code === 'PGRST116') {
          return new Error('Card not found in inventory. Please check the QR code or add the card to inventory first.')
        }
        if (data.detail.message && data.detail.message.includes('JSON object requested')) {
          return new Error('Card not found in your gym inventory. Please verify the QR code is valid.')
        }
      }
      
      switch (status) {
        case 400:
          // Check for specific error messages
          if (data.detail && data.detail.includes('not found in your inventory')) {
            return new Error('This card is not registered in your gym inventory. Please add it first or use a different card.')
          }
          return new Error(data.detail || 'Invalid QR code data')
        case 401:
          return new Error('Authentication required. Please log in again.')
        case 403:
          return new Error('Access denied. Insufficient permissions.')
        case 404:
          return new Error('Card not found in your gym inventory. Please verify the QR code.')
        case 409:
          return new Error(data.detail || 'Conflict: Card already registered')
        case 422:
          return new Error(data.detail || 'Invalid data provided')
        case 500:
          return new Error('Server error. Please try again later.')
        default:
          return new Error(data.detail || `Server error (${status})`)
      }
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection and try again.')
    } else {
      // Other error
      return new Error(error.message || 'An unexpected error occurred')
    }
  }

  /**
   * Get QR code scanning statistics (if needed for analytics)
   * @returns {Promise} Scan statistics
   */
  async getScanStatistics() {
    try {
      const response = await api.get('/api/admin/qr-scan-stats')
      return response.data
    } catch (error) {
      console.error('Get Scan Stats Error:', error)
      throw this.handleError(error)
    }
  }

  /**
   * Format scan result for display
   * @param {Object} scanResult - Raw scan result from API
   * @returns {Object} Formatted result for components
   */
  formatScanResult(scanResult) {
    return {
      success: scanResult.success || false,
      message: scanResult.message || 'QR code processed',
      details: scanResult.details || null,
      member: scanResult.member || null,
      card: scanResult.card || null,
      accessLog: scanResult.access_log || null,
      rawData: scanResult.qr_data || null,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Create QR code data for testing purposes
   * @param {string} cardId - The card ID
   * @param {string} cardType - The card type
   * @returns {string} QR code data
   */
  createQRData(cardId, cardType = 'standard') {
    const timestamp = Date.now()
    return `GYMSPHERE_CARD:${cardId}:${cardType}:${timestamp}`
  }
}

export default new QRScannerService()
