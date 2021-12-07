import { scaleLinear } from 'd3-scale'
import { DateTime } from 'luxon'
import { minBy, maxBy, last, max } from 'lodash-es'

import { CHART_WIDTH, PROJ_MARGIN, PROJ_STROKE_WIDTH } from './constants'

export const getXScale = (projects) => {
  // compute horizontal domain and scale
  const minProjExtent = DateTime.fromISO(
    minBy(projects, (proj) => proj.interval.start).interval.start
  )
  const maxProjExtent = DateTime.fromISO(maxBy(projects, (proj) => proj.interval.end).interval.end)

  return scaleLinear()
    .domain([minProjExtent, maxProjExtent])
    .range([100, CHART_WIDTH - 100])
}

export const getProjectsRows = (projects) => {
  const rows = []
  projects.forEach((proj) => {
    const freeRow = rows.find((rowProjects) => {
      const lastProj = last(rowProjects)
      const isRowFree = proj.interval.start > lastProj.interval.end

      return isRowFree
    })
    if (freeRow) freeRow.push(proj)
    else rows.push([proj])
  })
  return rows
}

export const getProjectsY = (projects) => {
  const projectRows = getProjectsRows(projects)
  let prevY = PROJ_MARGIN

  return projectRows.reduce((acc, row, i) => {
    const maxProjPeople = max(row.map((proj) => proj.people.length))
    const maxProjHeight = maxProjPeople * PROJ_STROKE_WIDTH + PROJ_MARGIN

    row.forEach((proj) => {
      acc[proj.name] = prevY
    })
    prevY += maxProjHeight

    return acc
  }, {})
}
