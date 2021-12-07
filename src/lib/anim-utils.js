import { getLinesColorsCount } from './filter-utils'
import { hexToRGB } from './utils'

export const getAnimInfo = (linesColorCount) => {
  const colorsInfo = Object.entries(linesColorCount).map(([color, pplNum]) => {
    const ledsNum = pplNum
    return {
      color,
      ledsNum,
    }
  })
  const colorsInfoWithOffset = colorsInfo.map((colorInfo, i) => {
    const offset = colorsInfo
      .map((color) => color.ledsNum)
      .slice(0, i)
      .reduce((acc, curr) => acc + curr, 0)

    return { ...colorInfo, offset }
  })
  return colorsInfoWithOffset
}

const colors = Array.from({ length: 60 }).map(() => {
  return { color: 'black', rgb: hexToRGB('#000000') }
})

export const computeLedAnimInfo = (lines) => {
  const colorCount = getLinesColorsCount(lines)
  const animInfo = getAnimInfo(colorCount)
  console.log(colorCount, animInfo)
  return animInfo
}

export function ledSequencer(
  colorsInfo = [
    { color: 'rgba(0,255,0,1)', ledsNum: 4, offset: 3 },
    { color: 'rgba(255,0,0,1)', ledsNum: 4, offset: 7 },
  ]
) {
  const newColors = [...colors]
  // console.log(colorsInfo)

  colorsInfo.forEach((colorInfo) => {
    const ledsNum = colorInfo.ledsNum
    const offset = colorInfo.offset

    for (let j = 0; j < ledsNum; j++) {
      const index = j + offset
      // if (index < 0 || index >= newColors.length) return
      newColors[index] = { color: colorInfo.color, rgb: hexToRGB(colorInfo.color) }
    }
  })

  return newColors
}
