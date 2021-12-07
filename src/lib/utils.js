import { round } from 'lodash'
import { useEffect, useRef } from 'react'
import { EYE_CORR, GAMMA_CORR } from './constants'

export const toPairs = (array) => array.slice(1).map((el, i) => [array[i], el])

export const filterByKeyName = (obj, values, getter = (v) => v) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([personName]) => {
      return values.includes(getter(personName))
    })
  )
}

export const hexToRGB = (hex) => {
  // i coeff moltiplicativiss servono a calibrare il colore
  const red = GAMMA_CORR[round(parseInt(hex[1] + hex[2], 16))]
  const green = GAMMA_CORR[round(parseInt(hex[3] + hex[4], 16) * 0.99)]
  const blue = GAMMA_CORR[round(parseInt(hex[5] + hex[6], 16) * 0.99)]
  // const red = 2
  // const green = 1
  // const blue = 5
  return { red, green, blue }
}
