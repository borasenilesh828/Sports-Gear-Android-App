/**
 * To check user logged in or not to proccess the request or to redirect login page
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
function isUserLoggedIn(req, res, next) {
  const propertyNames = Object.keys(req.sessionStore.sessions);
  if (propertyNames.length > 0) {
    const firstPropertyName = propertyNames[0];
    const firstPropertyValue = req.sessionStore.sessions[firstPropertyName];
    let cookie = JSON.parse(firstPropertyValue)

    if (cookie.admin !== null) {
      next()
      return
    }
    res.redirect('/')
    return
  }

  console.log('Admin not logged in')
  res.redirect('/')
}

module.exports = isUserLoggedIn