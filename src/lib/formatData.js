import { groupBy, map, maxBy, minBy, sortBy, uniqBy } from 'lodash-es'
import { DateTime, Interval } from 'luxon'
import { ROLES } from './constants'

const createInterval = (timesheet) => {
  const start = DateTime.fromISO(minBy(timesheet, 'TB_TIME_DATE').TB_TIME_DATE)
  const end = DateTime.fromISO(maxBy(timesheet, 'TB_TIME_DATE').TB_TIME_DATE)
  const interval = Interval.fromDateTimes(start.startOf('day'), end.endOf('day'))
  return interval
}

export function formatTimesheetProjects(timesheet) {
  const groupedByProj = groupBy(timesheet, (entry) => entry.JO_JOB_TITLE)

  const unsortedProjects = map(groupedByProj, (projEntries) => {
    const people = map(groupBy(projEntries, 'PE_NAME'), (personEntries) => {
      const personInfo = {
        name: personEntries[0].PE_NAME,
        interval: createInterval(personEntries),
      }
      return personInfo
    })

    const projectInfo = {
      name: projEntries[0].JO_JOB_TITLE,
      interval: createInterval(projEntries),
      people: people,
    }

    return projectInfo
  })

  const projects = sortBy(unsortedProjects, (projInfo) => [
    projInfo.interval.start,
    projInfo.interval.end,
  ])
  return projects
}

export const getPeopleRoles = (pplRoles) => pplRoles
