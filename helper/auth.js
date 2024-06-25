const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const secret = 'aeroCreatorPostUp'

const auths = {
  // Hash a password
  hashPassword: function (password) {
    return bcrypt.hashSync(password, 10)
  },

  // Compare a password with a hash
  comparePassword: function (password, hash) {
    return bcrypt.compareSync(password, hash)
  },

  // Generate a JWT
  generateToken: function (payload) {
    return jwt.sign(payload, secret)
  },

  // Verify a JWT
  verifyToken: function (token) {
    return jwt.verify(token, secret)
  },
}

module.exports = auths
