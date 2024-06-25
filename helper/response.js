function responseTemplate(res, statusCode, message, data) {
  return res.status(statusCode).json({
    status: statusCode,
    message: message,
    data: data,
  })
}

module.exports = responseTemplate
