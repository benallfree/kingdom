const gatherNeighbors = (_idx) => {
  const idx = +_idx
  const neighbors = []
  const row = Math.ceil(idx / 10)
  const col = ((idx - 1) % 10) + 1

  // Add left neighbor if not on left edge
  if (col > 1) neighbors.push(idx - 1)

  // Add right neighbor if not on right edge
  if (col < 10) neighbors.push(idx + 1)

  // Add top neighbor if not on top edge
  if (row > 1) neighbors.push(idx - 10)

  // Add bottom neighbor if not on bottom edge
  if (row < 10) neighbors.push(idx + 10)

  // Add diagonal neighbors
  // Top-left diagonal
  if (row > 1 && col > 1) neighbors.push(idx - 11)

  // Top-right diagonal
  if (row > 1 && col < 10) neighbors.push(idx - 9)

  // Bottom-left diagonal
  if (row < 10 && col > 1) neighbors.push(idx + 9)

  // Bottom-right diagonal
  if (row < 10 && col < 10) neighbors.push(idx + 11)
  return neighbors
}

module.exports = {
  gatherNeighbors,
}
