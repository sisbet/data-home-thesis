import React from 'react'
import { AnimatedDataset } from 'react-animated-dataset'

import { LINE_WIDTH } from '../lib/constants'
import { getPersonColor } from '../lib/people-utils'

export const Persons = ({ pplConnections, filteredConnections }) => {
  return (
    <>
      {Object.entries(pplConnections).map(([personName, personConnections]) => {
        const isFiltered = (filteredConnections[personName] || []).length > 0
        return (
          <g key={personName}>
            <AnimatedDataset
              duration={(personLine) => (personLine.x2 - personLine.x1) * 2}
              delay={(projConnection) => 50 + projConnection.x1 * 2}
              tag="line"
              dataset={personConnections}
              keyFn={(projConnection) => projConnection.name}
              attrs={{
                x1: (projConnection) => projConnection.x1,
                strokeWidth: LINE_WIDTH / 4,
                y1: (projConnection) => projConnection.y1,
                x2: (projConnection) => projConnection.x2,
                y2: (projConnection) => projConnection.y2,
                stroke: getPersonColor(personName),
                strokeOpacity: 0.5,
                strokeDasharray: (projConnection) => projConnection.length,
                strokeDashoffset: (projConnection) => (isFiltered ? 0 : projConnection.length),
              }}
            />
          </g>
        )
      })}
    </>
  )
}
