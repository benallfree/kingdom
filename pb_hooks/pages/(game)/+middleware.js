module.exports = (api) => {
  const { resolve, auth } = api

  const { advance } = resolve(`advance`)

  console.log(`advance`)
  advance(auth?.id)
}
