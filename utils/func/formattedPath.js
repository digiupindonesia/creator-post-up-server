module.exports = {
  formattedPath: (path) => {
    return path.replace(/\\/g, '\\\\\\\\').replace(/:/, '\\\\:')
  },
}
