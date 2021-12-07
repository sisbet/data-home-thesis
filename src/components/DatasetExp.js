import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { groupBy } from 'lodash-es'
import { AnimatedDataset } from 'react-animated-dataset'

import timesheet20 from '../../dataset/anonymous-timesheet-20.json'
import personNames from '../../dataset/people-20.json'
import projectNames from '../../dataset/proj-20.json'

import { formatTimesheetProjects } from '../lib/formatData'
import { LINE_TYPES, CHART_HEIGHT, CHART_WIDTH, FILTER_TYPES, ROLES } from '../lib/constants'
import { getAllLinesByPerson, getPeopleLines, getRole } from '../lib/people-utils'
import { getProjectsY, getXScale } from '../lib/project-utils'
import { filterVizByPpl, filterVizByProj, getLinesCount } from '../lib/filter-utils'
import { ledSequencer, computeLedAnimInfo } from '../lib/anim-utils'
import { postLeds } from '../lib/api-requests'

// compute projects formatted data
const projects = formatTimesheetProjects(timesheet20)

const projectsY = getProjectsY(projects)

// compute projects lines
const peopleLines = getPeopleLines(projects, projectsY, getXScale(projects))
const peopleLinesByPerson = groupBy(peopleLines, 'name')

const _allLinesByPerson = getAllLinesByPerson({
  peopleLinesByPerson,
  projects,
  projectsY,
  xScale: getXScale(projects),
})

const _allLines = Object.values(_allLinesByPerson).flat()

const filterFunctions = [
  // // Each project
  // ...projectNames.map((name) => filterVizByProj([name])),
  // // Each person
  filterVizByPpl(personNames),
  filterVizByPpl([]),
  // filterVizByPpl(['dev'], getRole),
  // filterVizByPpl([]),
  filterVizByPpl(['dataviz'], getRole),
  filterVizByPpl([]),
  filterVizByPpl(['dev', 'experience'], getRole),
  filterVizByPpl([]),
  filterVizByPpl(['BZTL3HVNMA']),
  filterVizByPpl([]),
  // filterVizByPpl(['IH0/IBTHML']),
  // filterVizByPpl([]),
  // filterVizByPpl(['7F1OGCFIAK']),
  // filterVizByPpl([]),
  // filterVizByPpl(['JFZDZHDPTD']),
  // filterVizByPpl([]),
  // filterVizByPpl(['UVUSXGIV9H']),
  // filterVizByPpl([]),
  // filterVizByPpl(['other, dataviz'], getRole),
  // filterVizByPpl([]),
  // filterVizByProj(projectNames),
  // filterVizByProj([]),
  // // Persons by each role
  // ...ROLES.map((role) => filterVizByPpl([role], getRole)),
]

export const DatasetExp = () => {
  const [filterIndex, setFilterIndex] = useState(0)

  const { type: filterType, filter: isLineFiltered } = filterFunctions[filterIndex]

  const currentLines = _allLines.filter(isLineFiltered)

  function gotoNextFilter() {
    setFilterIndex((i) => (i + 1) % filterFunctions.length)
  }

  useEffect(() => {
    setInterval(() => {
      gotoNextFilter()
      setTimeout(() => {
        gotoNextFilter()
      }, 5000)
    }, 8000)
  }, [])

  useEffect(() => {
    const isEntering = filterIndex % 2 === 0
    const filterIndexColors = isEntering ? filterIndex : filterIndex - 1
    const isLineFilteredColors = filterFunctions[filterIndexColors].filter
    const animInfo = computeLedAnimInfo(_allLines.filter(isLineFilteredColors))
    const leds = isEntering ? ledSequencer(animInfo) : ledSequencer(animInfo).reverse()
    const velScale = d3
      .scaleLinear()
      .domain([1, 37])
      .range([1000, isEntering ? 2000 : 7000])
    const animDuration = Math.round(velScale(getLinesCount(_allLines.filter(isLineFilteredColors))))
    const durationsIn = [2000, 3000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000]
    const durationsOut = [3000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000]
    const delaysOut = [3000, 3000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000]

    new Promise((resolve) => {
      isEntering ? resolve() : setTimeout(resolve, delaysOut[filterIndexColors * 0.5])
    }).then(() =>
      postLeds(
        leds,
        isEntering ? 'in' : 'out',
        isEntering ? durationsIn[filterIndexColors] : durationsOut[filterIndexColors]
      )
    )

    // console.log(leds)
  }, [currentLines, filterIndex])

  return (
    <div style={{ backgroundColor: '#1F2330' }}>
      <svg
        id="canvas"
        style={{
          width: CHART_WIDTH,
          height: CHART_HEIGHT,
        }}
      >
        <AnimatedDataset
          tag="path"
          dataset={currentLines}
          keyFn={(l) => String(filterIndex) + l.name + l.projName + l.type}
          attrs={{
            d: (l) => l.d,
            fill: 'none',
            stroke: (l) => l.stroke,
            strokeLinecap: 'round',
            strokeWidth: (l) => l.strokeWidth,
            opacity: (l) => l.opacity,
            strokeDasharray: (l) => `${l.length} ${l.firstLineLength ?? l.length}`,
            strokeDashoffset: (l) =>
              l.type === LINE_TYPES.firstLine
                ? -l.firstLineLength
                : l.type === LINE_TYPES.lastLine
                ? l.length
                : 0,
          }}
          init={{
            strokeLinecap: 'butt',
            strokeDashoffset: (l) => (isLineFiltered(l) ? l.length : -l.length),
          }}
          duration={(l) => l.duration}
          delay={(l) => (filterType === FILTER_TYPES.proj ? l.delayProj : l.delay) + 1400}
          easing={(t) => t}
        />
      </svg>
      {/* prr btn */}
      {/* <div style={{ position: 'fixed', bottom: '8%', left: '2%' }}>
        <button
          onClick={() => {
            setFilterIndex(() => (filterIndex + 1) % filterFunctions.length)
          }}
        >
          prrr
        </button>
      </div> */}
      {/*
      <Statistics projects={projects} /> */}
    </div>
  )
}
