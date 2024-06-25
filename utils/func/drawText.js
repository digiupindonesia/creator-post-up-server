const drawText = (
  text,
  color,
  borderColor,
  timeStart,
  timeEnd,
  fontPath,
  input,
  output
) => {
  return {
    filter: 'drawtext',
    options: {
      fontfile: fontPath,
      text: text,
      x: '(w-text_w)/2',
      y: '(h-text_h)/8',
      fontsize: '50',
      fontcolor: color,
      box: 1,
      boxcolor: `${borderColor}@0.6`,
      boxborderw: 10,
      text_align: 'C',
      enable: `between(t,${timeStart}, ${timeEnd})`,
    },
    inputs: input,
    outputs: output,
  }
}

module.exports = { drawText }
