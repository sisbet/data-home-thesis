import { scaleOrdinal, hsl, line, curveBumpX } from 'd3'
import { groupBy, mapValues, sortBy, last, min, first } from 'lodash-es'
import peopleRoles from '../../dataset/ppl-roles.json'

import { getPeopleRoles } from './formatData'
import {
  CHART_HEIGHT,
  CHART_WIDTH,
  CONNECTION_STROKE_WIDTH,
  LINE_TYPES,
  LINE_VELOCITY,
  PALETTE,
  PROJ_STROKE_WIDTH,
  ROLES,
} from './constants'
import timesheet20 from '../../dataset/anonymous-timesheet-20.json'
import { toPairs } from './utils'

const colorScale = scaleOrdinal(ROLES, PALETTE)

export const roleGetter = (person) => person.role

export const getRole = (name) => peopleRoles.find((roleInfo) => roleInfo.name === name).role

export const getPersonColor = (name) => {
  return colorScale(getRole(name))
}

const createPath = line(
  (p) => p.x,
  (p) => p.y
).curve(curveBumpX)

const computePathLength = (path) => {
  const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  pathElement.setAttribute('d', path)
  return pathElement.getTotalLength()
}

export const getPeopleLines = (projects, projectsY, xScale) => {
  return projects.flatMap((proj) => {
    return proj.people.map((personInfo, j) => {
      const strokeWidth = PROJ_STROKE_WIDTH
      const x1 = xScale(personInfo.interval.start)
      const x2 = xScale(personInfo.interval.end)
      const y1 = projectsY[proj.name] + j * strokeWidth
      const y2 = y1
      const linePoints = [
        { x: x1, y: y1 },
        { x: x2, y: y2 },
      ]
      const d = createPath(linePoints)

      const length = computePathLength(d)
      const stroke = getPersonColor(personInfo.name)
      const type = LINE_TYPES.project
      const opacity = 1

      return {
        name: personInfo.name,
        x1,
        x2,
        y1,
        y2,
        d,
        stroke,
        projName: proj.name,
        length,
        strokeWidth,
        type,
        opacity,
      }
    })
  })
}

export const getPplConnections = (peopleLinesByPerson) => {
  return Object.entries(peopleLinesByPerson).flatMap(([name, lines]) => {
    const sortedLines = sortBy(lines, ['x1', 'x2'])
    const linePairs = toPairs(sortedLines)
    const stroke = getPersonColor(name)
    const strokeWidth = CONNECTION_STROKE_WIDTH
    const opacity = 0.5
    const type = LINE_TYPES.connection

    return linePairs.map(([prevProjLine, currProjLine]) => {
      const x2 = currProjLine.x1
      const x1 = Math.min(prevProjLine.x2, x2)
      const y2 = currProjLine.y1
      const y1 = prevProjLine.y1
      const linePoints = [
        { x: x1, y: y1 },
        { x: x2, y: y2 },
      ]
      const d = createPath(linePoints)

      const length = computePathLength(d)

      return {
        projName: currProjLine.projName,
        x1,
        x2,
        y1,
        y2,
        d,
        length,
        name,
        stroke,
        strokeWidth,
        type,
        opacity,
      }
    })
  })
}
export const computeLineDuration = (l) => {
  return { ...l, duration: l.length * LINE_VELOCITY }
}
const projLinesDelays = (peopleLines) => {
  const pplLinesByProj = groupBy(peopleLines, 'projName')
  const pplLinesByProjWithDelay = mapValues(pplLinesByProj, (projLines) => {
    const minX1 = min(projLines.map((l) => l.x1))
    // console.log(minX1)
    const sortedLines = sortBy(projLines, 'y1')
    return sortedLines.map((l, i) => ({ ...l, delayProj: minX1 * 2 + i * 200 }))
  })
  const pplLinesWithDelay = Object.values(pplLinesByProjWithDelay).flat()
  return pplLinesWithDelay
}
function createFirstLine(secondLine) {
  const x1 = 0
  const y1 = CHART_HEIGHT / 2
  const x2 = secondLine.x1
  const y2 = secondLine.y1
  const linePoints = [
    { x: x1, y: y1 },
    { x: x2, y: y2 },
  ]
  const d = createPath(linePoints)

  const length = computePathLength(d)
  const name = secondLine.name

  const duration = length * LINE_VELOCITY
  const firstLine = {
    delay: 0,
    duration,
    x1,
    y1,
    x2,
    y2,
    d,
    length,
    name,
    stroke: getPersonColor(name),
    strokeWidth: CONNECTION_STROKE_WIDTH,
    type: LINE_TYPES.firstLine,
    opacity: 1,
  }
  return firstLine
}
function createLastLine(lastLine) {
  const x1 = lastLine.x2
  const y1 = lastLine.y2
  const x2 = CHART_WIDTH
  const y2 = CHART_HEIGHT / 2
  const linePoints = [
    { x: x1, y: y1 },
    { x: x2, y: y2 },
  ]
  const d = createPath(linePoints)

  const length = computePathLength(d)
  const name = lastLine.name
  const duration = 2 * length * LINE_VELOCITY
  const delay = lastLine.delay
  const line = {
    delay,
    duration,
    x1,
    y1,
    x2,
    y2,
    d,
    length,
    name,
    stroke: getPersonColor(name),
    strokeWidth: CONNECTION_STROKE_WIDTH,
    type: LINE_TYPES.lastLine,
    opacity: 1,
  }
  return line
}

export const getAllLinesByPerson = ({ peopleLinesByPerson, projects, projectsY, xScale }) => {
  const pplConnections = getPplConnections(peopleLinesByPerson)
  const peopleLines = getPeopleLines(projects, projectsY, xScale)
  const pplLinesWithDelay = projLinesDelays(peopleLines)
  const allLines = sortBy([...pplConnections, ...pplLinesWithDelay], 'x1')
  const allLinesByPersonWithoutDelay = groupBy(allLines, 'name')
  const allLinesByPerson = mapValues(allLinesByPersonWithoutDelay, (lines) => {
    const firstLine = createFirstLine(first(lines))
    const linesWithDuration = lines.reduce(
      (acc, line) => {
        const prevLine = last(acc)
        const duration = line.length * LINE_VELOCITY
        const prevDuration =
          line.x1 === prevLine.x2 ? prevLine.duration : (line.x1 - prevLine.x1) * LINE_VELOCITY
        const delay = prevLine.delay + prevDuration
        acc.push({ delay, duration, ...line })
        return acc
      },
      [firstLine]
    )
    linesWithDuration.push(createLastLine(last(linesWithDuration)))

    const durationsRatio =
      (last(linesWithDuration).duration + last(linesWithDuration).delay) /
      (linesWithDuration[0].duration + linesWithDuration[0].delay)
    linesWithDuration[0].duration *= durationsRatio
    linesWithDuration[0].delay *= durationsRatio

    const firstLineLength = linesWithDuration[0].length * durationsRatio
    linesWithDuration[0].firstLineLength = firstLineLength

    return linesWithDuration
  })

  return allLinesByPerson
}
