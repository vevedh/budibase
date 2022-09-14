const { Cookies } = require("../../constants")
const env = require("../../environment")
const { authError } = require("./utils")

exports.options = {
  ldap: {
    url:             'ldap://agglo.local',
    base:            'DC=agglo,DC=local',
    bindDN:          'ldapquery',
    bindCredentials: 'Ldap@Cacem972'
  }
}

exports.authenticate = async function (profile, done) {
  try {
    console.log("Windows auth :",profile)
    return done(null, profile)
  } catch (err) {
    return authError(done, "Windows Auth invalid", err)
  }
}
