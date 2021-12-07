import React from 'react'
import { DateTime, Interval } from 'luxon'
import { scaleLinear } from 'd3'
import { maxBy } from 'lodash-es'

const interval20 = Interval.fromDateTimes(
  DateTime.local(2020, 1, 1).startOf('day'),
  DateTime.local(2020, 12, 31).endOf('day')
)
const days20 = interval20.splitBy({ days: 1 }).map((d) => d.start)
const weeks20 = interval20.splitBy({ weeks: 1 }).map((w) => w.start)
const months20 = interval20.splitBy({ months: 1 }).map((w) => w.start)

export const Statistics = ({ projects }) => {
  const projectsDailyCount = days20.map((day) => {
    return { day: day, projects: projects.filter((proj) => proj.interval.contains(day)).length }
  })
  const projectsWeeklyCount = weeks20.map((week) => {
    return {
      week: week,
      projects: projects.filter(
        (proj) =>
          proj.interval.start.weekNumber <= week.weekNumber &&
          proj.interval.end.weekNumber >= week.weekNumber
      ).length,
    }
  })
  const projectsMonthlyCount = months20.map((month) => {
    return {
      month: month,
      projects: projects.filter(
        (proj) => proj.interval.start.month <= month.month && proj.interval.end.month >= month.month
      ).length,
    }
  })
  const maxDailyProjects = maxBy(projectsDailyCount, 'projects').projects
  const widthScaleDay = scaleLinear().domain([0, maxDailyProjects]).range([0, 900])

  const maxWeeklyProjects = maxBy(projectsWeeklyCount, 'projects').projects
  const widthScaleWeek = scaleLinear().domain([0, maxWeeklyProjects]).range([0, 900])

  const maxMonthlyProjects = maxBy(projectsMonthlyCount, 'projects').projects
  const widthScaleMonth = scaleLinear().domain([0, maxMonthlyProjects]).range([0, 900])

  return (
    <div>
      <h2>projects per day</h2>
      {projectsDailyCount.map((day, i) => {
        return (
          <div
            key={i}
            style={{
              width: `${widthScaleDay(day.projects)}px`,
              height: '15px',
              background: 'tomato',
              marginTop: '3px',
              fontSize: '10px',
            }}
          >
            {day.day.toLocaleString()} {day.projects}
          </div>
        )
      })}
      <h2>projects per week</h2>
      {projectsWeeklyCount.map((week, i) => {
        return (
          <div
            key={i}
            style={{
              width: `${widthScaleWeek(week.projects)}px`,
              height: '15px',
              background: 'tomato',
              marginTop: '3px',
              fontSize: '10px',
            }}
          >
            {week.week.toLocaleString()} {week.projects}
          </div>
        )
      })}
      <h2>projects per month</h2>
      {projectsMonthlyCount.map((month, i) => {
        return (
          <div
            key={i}
            style={{
              width: `${widthScaleMonth(month.projects)}px`,
              height: '15px',
              background: 'tomato',
              marginTop: '3px',
              fontSize: '10px',
            }}
          >
            {month.month.toLocaleString()} {month.projects}
          </div>
        )
      })}
    </div>
  )
}
