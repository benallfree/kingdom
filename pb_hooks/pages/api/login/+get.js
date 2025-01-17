module.exports = function (api) {
  const { auth, request, response, log, require } = api
  const user = (() => {
    if (auth) return auth
    const usersCollection = $app.findCollectionByNameOrId('users')
    const user = new Record(usersCollection)
    const password = $security.randomStringWithAlphabet(40, '123456789')
    user.setPassword(password)
    $app.save(user)
    return user
  })()
  const token = user.newAuthToken()
  const grid = require('grid').getCurrentGrid()
  return { token, user, grid }
}
