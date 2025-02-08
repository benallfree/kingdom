const applyDeltas = (roomState, deltas) => {
  // Helper function to recursively merge objects
  const mergeObjects = (target, source) => {
    for (const [key, value] of Object.entries(source)) {
      if (value === null) {
        delete target[key]
        continue
      }

      // Handle arrays and non-null objects
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          target[key] = value // Replace arrays directly
        } else {
          // For objects, create if doesn't exist and merge recursively
          target[key] = typeof target[key] === 'object' ? target[key] : {}
          mergeObjects(target[key], value)
        }
        continue
      }

      // Handle primitive values
      target[key] = value
    }
  }

  mergeObjects(roomState, deltas)
}

module.exports = { applyDeltas }
