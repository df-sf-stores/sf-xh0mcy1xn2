import { Link, useLocation, useStorefront } from '@dripfunnel/storefront-core/theme'
import { Layout } from '../components/Layout'
import { PolicyBody } from '../components/interactive/PolicyBody'
import { parsePolicy } from '../components/policyText'
import styles from '../styles/policy.module.css'

const kinds = ['privacy', 'returns', 'shipping', 'terms', 'legal'] as const
type Kind = (typeof kinds)[number]
const published = ['privacy', 'returns', 'shipping', 'terms'] as const

export const PolicyPage = () => {
  const { t, store } = useStorefront()
  const { path } = useLocation()
  const kind = kinds.find((k) => path === `/policies/${k}/` || path === `/policies/${k}`)
  // The store's own details, read from Site settings, fill the policies' {store}, {email}, {whatsapp} and {address}.
  const whatsapp = store.social.find((s) => s.network === 'whatsapp')
  const whatsappDigits = whatsapp ? whatsapp.url.replace(/^.*\//, '').replace(/\D/g, '') : ''
  const address = store.address ? [store.address.street, store.address.city, store.address.region, store.address.postal].filter((part) => part && part.trim()).join(', ') : ''
  const values = {
    store: store.name,
    email: store.contactEmail ?? '',
    whatsapp: whatsappDigits ? t('common.footer.whatsappNumber', { number: whatsappDigits }) : (store.contactPhone ?? ''),
    whatsappUrl: whatsapp?.url ?? '/contact/',
    whatsappTel: whatsappDigits ? t('pages.policy.tel', { number: whatsappDigits }) : '/contact/',
    address,
  }
  const pages: Record<Kind, { title: string; intro: string; status: string; body: string }> = {
    privacy: { title: t('policies.privacy.title'), intro: t('policies.privacy.intro', values), status: t('policies.privacy.status'), body: t('policies.privacy.body', values) },
    returns: { title: t('policies.returns.title'), intro: t('policies.returns.intro', values), status: t('policies.returns.status'), body: t('policies.returns.body', values) },
    shipping: { title: t('policies.shipping.title'), intro: t('policies.shipping.intro', values), status: t('policies.shipping.status'), body: t('policies.shipping.body', values) },
    terms: { title: t('policies.terms.title'), intro: t('policies.terms.intro', values), status: t('policies.terms.status'), body: t('policies.terms.body', values) },
    legal: { title: t('pages.policy.legal'), intro: '', status: 'pending', body: '' },
  }
  const page = kind ? pages[kind] : null
  const title = page ? page.title : t('pages.policy.title')
  const intro = page ? page.intro : t('pages.policy.lead')
  // A policy's `status` in content/{language}/policies.json: "pending" until its owner writes it, then "published",
  // or the date it was last updated, which shows under the title.
  const status = page ? page.status.trim().toLowerCase() : 'pending'
  const pending = status === 'pending'
  const updated = page && !pending && status !== 'published' ? page.status.trim() : ''
  const parsed = page && !pending ? parsePolicy(page.body) : null
  const others = published.filter((k) => k !== kind)
  return (
    <Layout>
      <header className={styles.band}>
        <div className={styles.bandInner}>
          <nav className={styles.crumbs} aria-label={t('pages.policy.crumbs')}>
            <Link href="/" className={styles.crumbLink}>
              {t('pages.policy.home')}
            </Link>
            <span className={styles.crumbSep} aria-hidden="true">
              /
            </span>
            <span className={styles.crumbCurrent} aria-current="page">
              {title}
            </span>
          </nav>
          <p className={styles.eyebrow}>{t('pages.policy.eyebrow')}</p>
          <h1 className={styles.title}>{title}</h1>
          {intro ? <p className={styles.intro}>{intro}</p> : null}
          {updated ? <p className={styles.updated}>{t('pages.policy.updated', { date: updated })}</p> : null}
        </div>
      </header>
      {parsed ? (
        <PolicyBody lead={parsed.lead} sections={parsed.sections} labels={{ contents: t('pages.policy.contents'), show: t('pages.policy.show'), hide: t('pages.policy.hide') }} />
      ) : (
        <div className={styles.body}>
          <article className={styles.article}>
            {/* Until the store owner writes this policy in content/en/policies.json, the page says so plainly. */}
            <aside className={styles.note}>
              <p className={styles.noteLabel}>{t('pages.policy.pendingTitle')}</p>
              {(page?.body || t('pages.policy.ask')).split('\n\n').map((line) => (
                <p key={line} className={styles.noteText}>
                  {line}
                </p>
              ))}
              <Link href="/contact/" className={styles.contact}>
                {t('pages.policy.contact')}
              </Link>
            </aside>
          </article>
        </div>
      )}
      {kind ? (
        <nav className={styles.others} aria-label={t('pages.policy.others')}>
          <div className={styles.othersInner}>
            <p className={styles.othersTitle}>{t('pages.policy.others')}</p>
            <div className={styles.othersLinks}>
              {others.map((k) => (
                <Link key={k} href={`/policies/${k}/`} className={styles.othersLink}>
                  {pages[k].title}
                  <svg className={styles.othersArrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      ) : null}
    </Layout>
  )
}
