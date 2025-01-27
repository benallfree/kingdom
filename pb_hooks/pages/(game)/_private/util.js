const applyDeltas = (roomState, deltas) => {
  Object.entries(deltas).forEach(([key, value]) => {
    const keys = key.split('.')
    const leafKey = keys.pop()

    // Helper function to recursively apply value to all matching paths
    const applyToNode = (node, remainingKeys) => {
      if (remainingKeys.length === 0) {
        node[leafKey] = value
        return
      }

      const currentKey = remainingKeys[0]
      const rest = remainingKeys.slice(1)

      if (currentKey === '*') {
        // Apply to all existing keys at this level
        Object.keys(node).forEach((k) => {
          if (!node[k]) node[k] = {}
          applyToNode(node[k], rest)
        })
      } else {
        // Regular key
        if (!node[currentKey]) node[currentKey] = {}
        applyToNode(node[currentKey], rest)
      }
    }

    applyToNode(roomState, keys)
  })
}

module.exports = { applyDeltas }
