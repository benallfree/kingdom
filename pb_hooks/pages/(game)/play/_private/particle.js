const defaultColorFactory = (x, y) => `hsl(${Math.random() * 60}, 70%, 60%)`

function pop(id, colorFactory = defaultColorFactory) {
  const e = document.getElementById(id)
  // Get element's position relative to the viewport
  const rect = e.getBoundingClientRect()
  // Add scroll position to get position relative to the document
  const x = rect.left + window.scrollX + rect.width / 2
  const y = rect.top + window.scrollY + rect.height / 2

  for (let i = 0; i < 30; i++) {
    // We call the function createParticle 30 times
    // As we need the coordinates of the mouse, we pass them as arguments
    createParticle(x, y, colorFactory)
  }
}

function createParticle(x, y, colorFactory = defaultColorFactory) {
  const particle = document.createElement('particle')
  document.body.appendChild(particle)

  // Calculate a random size from 5px to 25px
  const size = Math.floor(Math.random() * 20 + 5)
  particle.style.width = `${size}px`
  particle.style.height = `${size}px`
  // Generate a random color in a red/orange palette
  particle.style.background = colorFactory(x, y)

  // Generate a random x & y destination within a distance of 75px from the origin
  const destinationX = x + (Math.random() - 0.5) * 30
  const destinationY = y + (Math.random() - 0.5) * 30

  // Store the animation in a variable as we will need it later
  const animation = particle.animate(
    [
      {
        // Set the origin position of the particle
        // We offset the particle with half its size to center it around the mouse
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
        opacity: 1,
      },
      {
        // We define the final coordinates as the second keyframe
        transform: `translate(${destinationX}px, ${destinationY}px)`,
        opacity: 0,
      },
    ],
    {
      // Set a random duration from 500 to 1500ms
      duration: Math.random() * 1000 + 500,
      easing: 'cubic-bezier(0, .9, .57, 1)',
      // Delay every particle with a random value of 200ms
      delay: Math.random() * 200,
    }
  )

  // When the animation is complete, remove the element from the DOM
  animation.onfinish = () => {
    particle.remove()
  }
}
