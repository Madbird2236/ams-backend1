import { Link, useOutletContext } from 'react-router-dom'
import type { Assessment, Inspection } from '../types'
import { CATEGORIES } from '../data/checklist'
import { useT } from '../i18n'
import { Page } from '../components/Layout'
import { Track, Pill, Chevron } from '../components/ui'
import { CategoryIcon } from '../components/CategoryIcon'
import { isAssessed } from '../lib/model'

type Ctx = { insp: Inspection; assessments: Assessment[] }

export default function Checklist() {
  const { insp, assessments } = useOutletContext<Ctx>()
  const { t } = useT()

  return (
    <Page>
      <h2 className="mb-3 text-[16px] font-semibold leading-6">{t('select_area')}</h2>
      <ul className="panel divide-y divide-rule overflow-hidden">
        {CATEGORIES.map((c) => {
          const zones = insp.zones.filter((z) => z.categoryId === c.id)
          const total = zones.length * c.elements.length
          const catAss = assessments.filter((a) => a.categoryId === c.id && isAssessed(a))
          const p0 = catAss.filter((a) => a.priority === 'P0').length
          const p1 = catAss.filter((a) => a.priority === 'P1').length
          const done = catAss.length
          return (
            <li key={c.id}>
              <Link to={`/i/${insp.id}/c/${c.id}`} className="row py-3">
                <CategoryIcon id={c.id} size={22} className="text-muted shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[15px] font-medium">{c.code}. {t(`cat.${c.id}`)}</span>
                    {p0 > 0 && <Pill tone="alarm">P0 · {p0}</Pill>}
                    {p1 > 0 && <Pill tone="negative">P1 · {p1}</Pill>}
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <Track value={done} max={total} className="flex-1 max-w-40" />
                    <span className="num shrink-0 whitespace-nowrap text-[13px] text-muted">
                      {done}/{total}{c.repeatable ? ` · ${zones.length} ${t('zones').toLowerCase()}` : ''}
                    </span>
                  </div>
                </div>
                <Chevron />
              </Link>
            </li>
          )
        })}
      </ul>
    </Page>
  )
}
