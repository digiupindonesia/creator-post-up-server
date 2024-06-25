const { verifyToken } = require('../helper/auth')

const verifyAdminRole = async (req, res, next) => {
  try {
    let { access_token } = req.headers
    const decoded = decodeToken(access_token)
    if (decoded.role != 'admin') {
      return res.status(403).send({
        success: false,
        message: 'Access denied, only admin can access',
      })
    }
    next()
  } catch (err) {
    return res.status(403).send({
      success: false,
      message: err.message,
    })
  }
}

const authorization = async (req, res, next) => {
  try {
    let { access_token } = req.headers
    const decoded = verifyToken(access_token)
    if (!decoded) {
      return res.status(403).send({
        success: false,
        message: 'Access denied, you must login before this action',
      })
    }
    next()
  } catch (err) {
    return res.status(403).send({
      success: false,
      message: 'Access denied, you must login before this action',
    })
  }
}

module.exports = { verifyAdminRole, authorization }
//   authorization,
