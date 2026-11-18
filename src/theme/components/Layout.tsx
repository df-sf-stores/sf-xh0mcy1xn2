import type { ReactNode } from 'react'
import { ConsentBanner, Link, PoweredBy, PreviewBanner, StoreLogo, ThemeImage, useCart, useCollections, useMenu, useStorefront, useWishlist } from '@dripfunnel/storefront-core/theme'
import { DrawerGroup } from './interactive/DrawerGroup'
import { InfoMenu } from './interactive/InfoMenu'
import { Menu } from './interactive/Menu'
import { NavItem } from './interactive/NavItem'
import { SearchToggle } from './interactive/SearchToggle'
import styles from '../styles/layout.module.css'

const GlobeIcon = () => (
  <svg className={styles.globe} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5s-1.1 5.9-3.6 8.5c-2.5-2.6-3.6-5.4-3.6-8.5s1.1-5.9 3.6-8.5z" />
  </svg>
)

export const Layout = ({ children }: { children: ReactNode }) => {
  const { store, t, mode, poweredBy } = useStorefront()
  const menu = useMenu()
  // `first: 20` matches the home page's request, so both share one answer.
  const { collections: fetched, status } = useCollections({ first: 20 })
  const collections = status === 'ready' ? fetched : []
  const { count } = useCart()
  const { count: wished } = useWishlist()
  const whatsapp = store.social.find((s) => s.network === 'whatsapp')
  const whatsappNumber = whatsapp ? whatsapp.url.replace(/^.*\//, '').replace(/\D/g, '') : ''
  const address = store.address ? [store.address.street, store.address.city, store.address.region, store.address.postal].filter((part) => part && part.trim()).join(', ') : ''
  // Shop all, then the store's collections in the store's own order, at the addresses the catalogue gives them.
  const shop = [{ key: 'all', label: t('common.nav.shopAllProducts'), href: '/collections/all/' }, ...collections.map((c) => ({ key: c.id, label: c.name, href: c.href }))]
  const information = [
    { key: 'about', label: t('common.nav.about'), href: '/about/' },
    { key: 'contact', label: t('common.nav.contact'), href: '/contact/' },
    { key: 'faq', label: t('common.nav.faq'), href: '/help/' },
    { key: 'shipping', label: t('common.nav.shipping'), href: '/policies/shipping/' },
    { key: 'returns', label: t('common.nav.returns'), href: '/policies/returns/' },
  ]
  return (
    <div className={styles.shell}>
      {mode === 'live' ? null : <PreviewBanner t={t} className={styles.preview} />}
      <header className={styles.header}>
        <div className={styles.bar}>
          <div className={styles.start}>
            <Menu label={t('common.nav.menu')}>
              <nav className={styles.drawer} aria-label={t('common.nav.label')}>
                <DrawerGroup label={t('common.nav.shopAll')} links={shop} />
                {menu.items.map((item) => (
                  <Link key={item.id} href={item.href} className={styles.drawerLink}>
                    {item.label}
                  </Link>
                ))}
                <p className={styles.drawerHeading}>{t('common.nav.information')}</p>
                {information.map((link) => (
                  <Link key={link.key} href={link.href} className={styles.drawerSub}>
                    {link.label}
                  </Link>
                ))}
                <p className={styles.drawerHeading}>{t('common.tools.account')}</p>
                <Link href="/account/" className={styles.drawerSub}>
                  {t('common.tools.account')}
                </Link>
                <Link href="/account/wishlist/" className={styles.drawerSub}>
                  {t('common.tools.wishlist')}
                </Link>
                <Link href="/account/orders/" className={styles.drawerSub}>
                  {t('common.footer.orders')}
                </Link>
              </nav>
            </Menu>
            <nav className={styles.nav} aria-label={t('common.nav.label')}>
              <InfoMenu label={t('common.nav.shopAll')} links={shop} align="start" className={styles.shopMenu} />
              {menu.items.map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
            </nav>
          </div>
          <Link href="/" className={styles.brand}>
            <StoreLogo className={styles.logo} />
          </Link>
          <div className={styles.tools}>
            <InfoMenu label={t('common.nav.information')} links={information} />
            <p className={styles.language}>
              <GlobeIcon />
              <span className={styles.hidden}>{t('common.nav.language')}</span>
              {t('common.nav.languageName')}
            </p>
            <span className={styles.divider} aria-hidden="true" />
            <SearchToggle labels={{ open: t('common.tools.searchOpen'), close: t('common.tools.searchClose'), search: t('common.tools.search'), prompt: t('common.tools.searchPrompt') }} />
            <Link href="/account/" className={styles.tool}>
              <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="12" cy="8.5" r="3.8" />
                <path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4" />
              </svg>
              <span className={styles.hidden}>{t('common.tools.account')}</span>
            </Link>
            <Link href="/account/wishlist/" className={styles.toolWide}>
              <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7.3a4.3 4.3 0 017.5 2.5C19.5 15.4 12 20 12 20z" />
              </svg>
              <span className={styles.hidden}>{wished > 0 ? t('common.tools.wishlistCount', { count: wished }) : t('common.tools.wishlist')}</span>
              {wished > 0 ? (
                <span className={styles.count} aria-hidden="true">
                  {wished}
                </span>
              ) : null}
            </Link>
            <Link href="/cart/" className={styles.tool}>
              <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M5.5 8h13l-1 12h-11z" />
                <path d="M9 8V6.5a3 3 0 016 0V8" />
              </svg>
              <span className={styles.hidden}>{count > 0 ? t('common.tools.cartCount', { count }) : t('common.tools.cart')}</span>
              {count > 0 ? (
                <span className={styles.count} aria-hidden="true">
                  {count}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <div className={styles.columns}>
          <div className={styles.about}>
            <Link href="/" className={styles.footerBrand}>
              <StoreLogo className={styles.footerLogo} />
            </Link>
            {store.tagline ? <p className={styles.tagline}>{store.tagline}</p> : null}
            <p className={styles.note}>{store.description || t('common.footer.note')}</p>
          </div>
          {address || store.contactEmail || store.contactPhone || whatsapp ? (
            <div className={styles.links}>
              <h2 className={styles.heading}>{t('common.footer.touch')}</h2>
              {address ? (
                <div className={styles.contact}>
                  <svg className={styles.contactIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z" />
                    <circle cx="12" cy="10" r="2.3" />
                  </svg>
                  <div className={styles.contactText}>
                    <p className={styles.contactLabel}>{t('common.footer.address')}</p>
                    <p className={styles.contactValue}>{address}</p>
                  </div>
                </div>
              ) : null}
              {store.contactEmail ? (
                <div className={styles.contact}>
                  <svg className={styles.contactIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <rect x="3.5" y="5.5" width="17" height="13" rx="1" />
                    <path d="M4 6.5l8 6 8-6" />
                  </svg>
                  <div className={styles.contactText}>
                    <p className={styles.contactLabel}>{t('common.footer.email')}</p>
                    {/* Core's Link opens only store paths, http(s) and tel: addresses, so the email is shown to copy, not as a mailto: link. */}
                    <p className={styles.contactValue}>{store.contactEmail}</p>
                  </div>
                </div>
              ) : null}
              {store.contactPhone ? (
                <div className={styles.contact}>
                  <svg className={styles.contactIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M6.6 3.5h3l1.5 4-2 1.3a10 10 0 005.1 5.1l1.3-2 4 1.5v3a1.6 1.6 0 01-1.7 1.6A15.5 15.5 0 015 5.2 1.6 1.6 0 016.6 3.5z" />
                  </svg>
                  <div className={styles.contactText}>
                    <p className={styles.contactLabel}>{t('common.footer.phone')}</p>
                    <p className={styles.contactValue}>{store.contactPhone}</p>
                  </div>
                </div>
              ) : null}
              {whatsapp ? (
                <div className={styles.contact}>
                  <svg className={styles.contactIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M12 3.5a8.5 8.5 0 00-7.4 12.7L3.5 20.5l4.4-1.1A8.5 8.5 0 1012 3.5z" />
                    <path d="M9 8.5c0 3.6 2.9 6.5 6.5 6.5l1-1.6-2-1-1 .9a5 5 0 01-2.8-2.8l.9-1-1-2z" />
                  </svg>
                  <div className={styles.contactText}>
                    <p className={styles.contactLabel}>{t('common.footer.whatsappLabel')}</p>
                    <Link href={whatsapp.url} className={styles.contactLink}>
                      {whatsappNumber ? t('common.footer.whatsappNumber', { number: whatsappNumber }) : t('common.footer.whatsapp')}
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          <div className={styles.links}>
            <h2 className={styles.heading}>{t('common.footer.shop')}</h2>
            <Link href="/collections/all/" className={styles.footerLink}>
              {t('common.footer.all')}
            </Link>
            {collections.map((c) => (
              <Link key={c.id} href={c.href} className={styles.footerLink}>
                {c.name}
              </Link>
            ))}
          </div>
          <div className={styles.links}>
            <h2 className={styles.heading}>{t('common.footer.company')}</h2>
            <Link href="/about/" className={styles.footerLink}>
              {t('common.nav.about')}
            </Link>
            <Link href="/contact/" className={styles.footerLink}>
              {t('common.nav.contact')}
            </Link>
            <Link href="/help/" className={styles.footerLink}>
              {t('common.footer.faq')}
            </Link>
            <Link href="/account/orders/" className={styles.footerLink}>
              {t('common.footer.orders')}
            </Link>
          </div>
        </div>
        <div className={styles.base}>
          <p className={styles.copyright}>{t('common.footer.rights', { store: store.name })}</p>
          <nav className={styles.legal} aria-label={t('common.footer.legal')}>
            <Link href="/policies/privacy/" className={styles.legalLink}>
              {t('common.footer.privacy')}
            </Link>
            <Link href="/policies/returns/" className={styles.legalLink}>
              {t('common.footer.returns')}
            </Link>
            <Link href="/policies/shipping/" className={styles.legalLink}>
              {t('common.footer.shipping')}
            </Link>
            <Link href="/policies/terms/" className={styles.legalLink}>
              {t('common.footer.terms')}
            </Link>
          </nav>
          {/* Where the platform names its brand, core's sealed line must show (the publish gate checks it); the logo follows it. */}
          <div className={styles.attribution}>
            {poweredBy ? <PoweredBy brand={poweredBy} t={t} className={styles.powered} /> : <span className={styles.poweredWords}>{t('common.footer.poweredBy')}</span>}
            <Link href={t('common.footer.poweredUrl')} className={styles.poweredLink}>
              <ThemeImage src="dripfunnel-logo.png" alt={t('common.footer.poweredAlt')} ratio={845 / 143} sizes="96px" className={styles.poweredLogo} />
            </Link>
          </div>
        </div>
      </footer>
      {whatsapp ? (
        <Link href={whatsapp.url} className={styles.whatsapp}>
          <svg className={styles.whatsappIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 3a9 9 0 00-7.8 13.5L3 21l4.6-1.2A9 9 0 1012 3zm4.4 12.4c-.2.5-1.1 1-1.6 1-.4.1-.9.1-1.5-.1a13 13 0 01-1.4-.5 10.6 10.6 0 01-4-3.6 4.6 4.6 0 01-1-2.4c0-1.2.6-1.7.8-2 .2-.2.5-.3.6-.3h.5c.1 0 .4 0 .6.4l.8 1.9c.1.1.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 1.9 1 .9 1.9 1.2 2.2 1.3.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.7-.1 1.3z" />
          </svg>
          <span className={styles.hidden}>{t('common.footer.whatsapp')}</span>
        </Link>
      ) : null}
      <ConsentBanner t={t} className={styles.consent} />
    </div>
  )
}
