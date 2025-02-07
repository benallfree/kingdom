const applyDeltas = (roomState, deltas) => {
  // Helper function to recursively merge objects
  const mergeObjects = (target, source) => {
    if (Array.isArray(source) || Array.isArray(target)) {
      throw new Error('Arrays are not supported in deltas')
    }

    Object.entries(source).forEach(([key, value]) => {
      if (value === null) {
        // Delete property if value is null
        delete target[key]
      } else if (typeof value === 'object' && value !== null) {
        // Initialize target key if it doesn't exist
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {}
        }
        // Recursively merge nested objects
        mergeObjects(target[key], value)
      } else {
        // Set value directly for primitives
        target[key] = value
      }
    })
  }

  mergeObjects(roomState, deltas)
}

module.exports = { applyDeltas }
