import { NavLink, Outlet, useParams } from 'react-router-dom'
import { useInspection, useAssessments } from '../db/hooks'
import { useT } from '../i18n'
import { TopBar } from '../components/Layout'
import { hotelDisplayName, allSlots, isAssessed } from '../lib/model'

export default function InspectionLayout() {
  const { id } = useParams()
  const { t } = useT()
  const insp = useInspection(id)
  const assessments = useAssessments(id)

  if (insp === undefined) return null
  if (insp === null) return <div className="p-6 text-center text-muted">Not found. <a href="/" className="underline">{t('home')}</a></div>

  const slots = allSlots(insp)
  const byKey = new Map((assessments ?? []).map((a) => [`${a.zoneId}|${a.elementId}`, a]))
  const assessed = slots.filter((s) => isAssessed(byKey.get(`${s.zoneId}|${s.elementId}`))).length

  const tabs = [
    { to: '', label: t('tab_hotel'), end: true },
    { to: 'checklist', label: t('tab_checklist') },
    { to: 'summary', label: t('tab_summary') },
    { to: 'budget', label: t('tab_budget') },
    { to: 'report', label: t('tab_report') },
  ]

  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        title={hotelDisplayName(insp.hotel, t('untitled_hotel'))}
        subtitle={`${t('progress')} ${assessed}/${slots.length} · ${insp.status === 'completed' ? t('status_completed') : t('status_draft')}`}
        back="/"
      />
      <nav className="sticky top-14 z-10 border-b border-border bg-ground" aria-label="Sections">
        <div className="mx-auto flex max-w-3xl overflow-x-auto">
          {tabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to} end={tab.end} className="tab">{tab.label}</NavLink>
          ))}
        </div>
      </nav>
      <Outlet context={{ insp, assessments: assessments ?? [] }} />
    </div>
  )
}
