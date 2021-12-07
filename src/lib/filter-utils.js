import { countBy, uniqBy } from 'lodash'
import { LINE_TYPES, FILTER_TYPES } from './constants'

export const filterVizByPpl = (values, getter = (v) => v) => {
  //console.log('Filter ppl by', values)

  return { type: FILTER_TYPES.ppl, filter: (line) => values.includes(getter(line.name)) }
}

export const filterVizByProj = (projectNames) => {
  //console.log('Filter proj by', projectNames)
  return {
    type: FILTER_TYPES.proj,
    filter: (line) => projectNames.includes(line.projName) && line.type === LINE_TYPES.project,
  }
}

export const getLinesColorsCount = (lines) => {
  const uniqByPerson = uniqBy(lines, 'name')
  console.log(lines, uniqByPerson)
  return countBy(uniqByPerson, 'stroke')
}

export const getLinesCount = (lines) => {
  const uniqByPerson = uniqBy(lines, 'name')
  return uniqByPerson.length
}
