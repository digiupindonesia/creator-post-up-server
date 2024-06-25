module.exports = {
  formatType: (video) => {
    const fileType = video.mimetype

    if (fileType !== 'video/mp4') {
      return 'Invalid file type, only MP4 is allowed!'
    }
  },
  formatSize: (video) => {
    const maxSizeVideo = 2 * 1024 * 1024
    const fileSize = video.size
    if (fileSize > maxSizeVideo) {
      return 'File size video maximum 2MB'
    }
  },
}
