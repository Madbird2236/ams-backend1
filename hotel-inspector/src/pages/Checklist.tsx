import { Link, useOutletContext } from 'react-router-dom'
import type { Assessment, Inspection } from '../types'
import { CATEGORIES } from '../data/checklist'
import { useT } from '../i18n'
import { Page } from '../components/Layout'
import { ProgressBar } from '../components/ui'
import { isAssessed } from '../lib/model'

type Ctx = { insp: Inspection; assessments: Assessment[] }

export default function Checklist() {
  const { insp, assessments } = useOutletContext<Ctx>()
  const { t } = useT()

  return (
    <Page>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">{t('select_area')}</h2>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((c) => {
          const zones = insp.zones.filter((z) => z.categoryId === c.id)
          const total = zones.length * c.elements.length
          const catAss = assessments.filter((a) => a.categoryId === c.id && isAssessed(a))
          const p0 = catAss.filter((a) => a.priority === 'P0').length
          const p1 = catAss.filter((a) => a.priority === 'P1').length
          const done = catAss.length
          return (
            <Link key={c.id} to={`/i/${insp.id}/c/${c.id}`} className="card flex min-h-32 flex-col justify-between p-3 hover:bg-slate-50 active:bg-slate-100">
              <div className="flex items-start justify-between">
                <span className="text-2xl">{c.icon}</span>
                <span className="rounded-md bg-brand-900 px-1.5 py-0.5 text-[10px] font-bold text-white">{c.code}</span>
              </div>
              <div>
                <div className="text-sm font-bold leading-tight">{t(`cat.${c.id}`)}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {c.repeatable ? `${zones.length} ${t('zones').toLowerCase()} · ` : ''}{done}/{total}
                </div>
                <ProgressBar value={done} max={total} className="mt-2" />
                {(p0 > 0 || p1 > 0) && (
                  <div className="mt-2 flex gap-1">
                    {p0 > 0 && <span className="chip bg-red-600 text-white">P0 ×{p0}</span>}
                    {p1 > 0 && <span className="chip bg-orange-500 text-white">P1 ×{p1}</span>}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </Page>
  )
}
