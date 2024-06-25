const { Auth } = require('../models')
const auths = require('../helper/auth')
const responseTemplate = require('../helper/response')

module.exports = {
  login: async (req, res) => {
    const { username, password } = req.body

    try {
      const user = await Auth.findOne({
        where: { username: username },
        attributes: ['auth_id', 'username', 'password', 'email'],
      })
      if (!user) return responseTemplate(res, 404, 'User not found', null)

      const isPasswordValid = auths.comparePassword(password, user.password)
      if (!isPasswordValid)
        return responseTemplate(res, 401, 'Wrong Password', null)

      const { id, username: userName, email } = user
      const token = auths.generateToken({ id, username: userName, email })

      return responseTemplate(res, 200, 'Login Success', {
        access_token: token,
      })
    } catch (error) {
      console.error(error)
      return responseTemplate(res, 500, 'Internal Server Error', null)
    }
  },

  register: async (req, res) => {
    try {
      const { username, email, password } = req.body
      const user = await Auth.create({ username, email, password })

      return responseTemplate(
        200,
        `Registration with ${user.username} Success`,
        {
          username: user.username,
        }
      )
    } catch (error) {
      console.error(error)
      return responseTemplate(500, 'Internal Server Error', null)
    }
  },
}
