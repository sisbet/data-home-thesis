import React from 'react'
import { AnimatedDataset } from 'react-animated-dataset'

import { CHART_WIDTH, LINE_WIDTH } from '../lib/constants'

export const Projects = ({ projectsLines, projectsY, filteredProjLines }) => {
  return (
    <>
      {projectsLines.map((projLines) => {
        const projName = projLines[0].projName
        const filteredPerson = filteredProjLines[projName] ?? []
        const isProjFiltered = filteredPerson.length > 0
        const filteredPersonNames = filteredPerson.map((lines) => lines.name)
        return (
          <g key={projName}>
            <line
              y1={projectsY[projName]}
              x1={10}
              y2={projectsY[projName]}
              x2={CHART_WIDTH}
              stroke="black"
              strokeWidth={1}
              strokeOpacity={0.01}
            />
            {projLines.map((personLine, j) => {
              const isPersonFiltered =
                isProjFiltered &&
                filteredProjLines[projName].map((lines) => lines.name).includes(personLine.name)
              return (
                // role(personLine.name) === 'ds' &&
                <g key={projName + j}>
                  <line
                    strokeWidth={LINE_WIDTH}
                    x1={personLine.x1}
                    y1={personLine.y}
                    x2={personLine.x2}
                    y2={personLine.y}
                    stroke={personLine.strokeColor}
                    strokeOpacity={0.2}
                  />
                </g>
              )
            })}
            <AnimatedDataset
              duration={(personLine) => personLine.length * 2}
              dataset={projLines.filter((personLine) =>
                filteredPersonNames.includes(personLine.name)
              )}
              delay={(personLine) => personLine.x1 * 2}
              tag="line"
              keyFn={(personLine) => personLine.name}
              attrs={{
                strokeWidth: LINE_WIDTH,
                x1: (personLine) => personLine.x1,
                y1: (personLine) => personLine.y,
                x2: (personLine) => personLine.x2,
                y2: (personLine) => personLine.y,
                stroke: (personLine) => personLine.strokeColor,

                strokeDasharray: (personLine) => personLine.length,
                strokeDashoffset: 0,
              }}
              init={{
                strokeDashoffset: (personLine) =>
                  filteredPersonNames.includes(personLine.name)
                    ? personLine.length
                    : -personLine.length,
              }}
            />
          </g>
        )
      })}
    </>
  )
}
