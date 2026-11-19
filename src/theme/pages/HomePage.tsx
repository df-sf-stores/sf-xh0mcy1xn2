import { Image, Link, Price, useCollections, useProductCards, useProducts, useStorefront, type ProductCard as Card } from '@dripfunnel/storefront-core/theme'
import { Layout } from '../components/Layout'
import { cx } from '../components/cx'
import styles from '../styles/home.module.css'

/** The store's own products, by the address the catalogue gives them. */
const slugs = {
  mirror: 'blue-mirror-spectacular',
  stop: 'cant-stop-wont-stop',
  cardBar: 'card-bar',
  bowl: 'cement-hold-thy-heart-bowl',
  chess: 'checkmate-chessboard-hanger',
} as const
/** Shop the look's order, which is also the order the home page asks the catalogue for them. */
const lookOrder: readonly string[] = [slugs.mirror, slugs.stop, slugs.cardBar, slugs.bowl, slugs.chess]

const slugOfCard = (card: Card) => card.href.replace(/\/$/, '').split('/').pop() ?? ''
const find = (cards: readonly Card[], slug: string) => cards.find((c) => slugOfCard(c) === slug)
const pad = (n: number) => String(n).padStart(2, '0')

const Arrow = () => (
  <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const Corner = () => (
  <svg className={styles.corner} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
)

const Eyebrow = ({ children }: { children: string }) => (
  <p className={styles.eyebrow}>
    <span className={styles.eyebrowRule} aria-hidden="true" />
    {children}
  </p>
)

const CardPrice = ({ card }: { card: Card }) => {
  const { store, locale, t } = useStorefront()
  if (!card.price) return null
  return (
    <p className={styles.storyPrice}>
      {card.from ? <span>{t('shop.card.from')} </span> : null}
      <Price money={card.price} compareAt={card.compareAt} includesTax={store.pricesIncludeTax} locale={locale} t={t} className={styles.price} />
    </p>
  )
}

/** 1 · Split editorial hero: the headline on the left, two products at different sizes and heights on the right. */
const Hero = ({ lead, second, ready, collectionsHref }: { lead: Card | undefined; second: Card | undefined; ready: boolean; collectionsHref: string }) => {
  const { t } = useStorefront()
  const figures = [lead, second].filter((c): c is Card => c !== undefined)
  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <h1 className={styles.heroTitle}>
          <span className={styles.heroLine}>{t('home.hero.line1')}</span>
          <span className={styles.heroLine}>{t('home.hero.line2')}</span>
          <span className={cx(styles.heroLine, styles.red)}>{t('home.hero.accent')}</span>
        </h1>
        <div className={styles.heroFoot}>
          <p className={styles.heroLead}>{t('home.hero.lead')}</p>
          <div className={styles.actions}>
            <Link href="/collections/all/" className={styles.solid}>
              {t('home.hero.shopAll')}
            </Link>
            <Link href={collectionsHref} className={styles.outline}>
              {t('home.hero.collections')}
            </Link>
          </div>
        </div>
      </div>
      <div className={styles.heroArt} aria-busy={!ready}>
        <h2 className={styles.hidden}>{t('home.hero.pictures')}</h2>
        {figures.length === 0 ? <div className={styles.heroHold} /> : null}
        {figures.map((card, index) => (
          <Link key={card.id} href={card.href} className={index === 0 ? styles.heroMain : styles.heroSide}>
            <span className={styles.heroFrame}>
              {card.photo ? (
                <Image
                  image={card.photo}
                  alt={card.photo.alt ?? card.name}
                  ratio={index === 0 ? 0.8 : 0.75}
                  sizes={index === 0 ? '(min-width: 1024px) 28vw, 58vw' : '(min-width: 1024px) 16vw, 36vw'}
                  className={styles.cover}
                />
              ) : null}
              <span className={styles.heroIndex} aria-hidden="true">
                {pad(index + 1)}
              </span>
            </span>
            <span className={styles.caption}>
              <span className={styles.captionNumber}>{t('home.hero.index', { number: pad(index + 1) })}</span>
              <span className={styles.captionName}>{card.name}</span>
              <Corner />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

/** 2 · The brand, set large, with one line, a short paragraph and a product photograph. */
const Intro = ({ card }: { card: Card | undefined }) => {
  const { t, store } = useStorefront()
  return (
    <section className={cx(styles.intro, styles.reveal)}>
      <div className={styles.introInner}>
        <h2 className={styles.introName}>{store.name}</h2>
        <div className={styles.introGrid}>
          <div className={styles.introCopy}>
            <p className={styles.introSupporting}>{t('home.intro.supporting')}</p>
            <p className={styles.body}>{t('home.intro.body')}</p>
            <Link href="/collections/all/" className={styles.textLink}>
              {t('home.intro.action')}
              <Arrow />
            </Link>
          </div>
          {card?.photo ? (
            <Link href={card.href} className={styles.introPicture}>
              <span className={styles.introFrame}>
                <Image image={card.photo} alt={card.photo.alt ?? card.name} ratio={1.25} sizes="(min-width: 1024px) 50vw, 100vw" className={styles.cover} />
              </span>
              <span className={styles.captionPlain}>{card.name}</span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}

type Story = { card: Card; text: string }

/** 3 · Products told one at a time, picture and words alternating sides. */
const Stories = ({ stories }: { stories: Story[] }) => {
  const { t } = useStorefront()
  if (!stories.length) return null
  return (
    <section className={styles.section}>
      <div className={cx(styles.head, styles.reveal)}>
        <div>
          <Eyebrow>{t('home.story.eyebrow')}</Eyebrow>
          <h2 className={styles.display}>
            <span className={styles.heroLine}>{t('home.story.title')}</span>
            <span className={cx(styles.heroLine, styles.red)}>{t('home.story.accent')}</span>
          </h2>
        </div>
      </div>
      <ol className={styles.storyList}>
        {stories.map(({ card, text }, index) => (
          <li key={card.id} className={cx(styles.story, styles.reveal, index % 2 === 1 && styles.storyFlip)}>
            <Link href={card.href} className={styles.storyPicture}>
              <span className={styles.storyFrame}>{card.photo ? <Image image={card.photo} alt={card.photo.alt ?? card.name} ratio={1} sizes="(min-width: 1024px) 50vw, 100vw" className={styles.cover} /> : null}</span>
            </Link>
            <div className={styles.storyCopy}>
              <span className={styles.storyNumber} aria-hidden="true">
                {pad(index + 1)}
              </span>
              <h3 className={styles.storyName}>{card.name}</h3>
              <p className={styles.body}>{text}</p>
              <CardPrice card={card} />
              <Link href={card.href} className={styles.textLink}>
                {t('home.story.view')}
                <Arrow />
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** 4 · A full-width gallery of square pictures at two sizes, each a link to its product. */
const Look = ({ cards }: { cards: Card[] }) => {
  const { t, store } = useStorefront()
  const instagram = store.social.find((s) => s.network === 'instagram')
  const pictured = cards.filter((c) => c.photo).slice(0, 5)
  if (!pictured.length) return null
  return (
    <section className={styles.lookSection}>
      <div className={cx(styles.head, styles.lookHead, styles.reveal)}>
        <div>
          <Eyebrow>{t('home.look.eyebrow')}</Eyebrow>
          <h2 className={styles.display}>{t('home.look.title')}</h2>
        </div>
        {instagram ? (
          <Link href={instagram.url} className={styles.textLink}>
            {t('home.look.instagram')}
            <Corner />
          </Link>
        ) : null}
      </div>
      <ul className={cx(styles.look, styles.reveal)}>
        {pictured.map((card, index) =>
          card.photo ? (
            <li key={card.id} className={styles.lookItem}>
              <Link href={card.href} className={styles.lookLink}>
                <Image image={card.photo} alt={t('home.look.view', { name: card.name })} ratio={1} sizes={index === 0 ? '(min-width: 600px) 50vw, 100vw' : '(min-width: 600px) 25vw, 50vw'} className={styles.cover} />
                <span className={styles.lookName} aria-hidden="true">
                  <span className={styles.lookNumber}>{pad(index + 1)}</span>
                  <span className={styles.lookTitle}>{card.name}</span>
                  <span className={styles.lookShop}>
                    {t('home.look.shop')}
                    <Corner />
                  </span>
                </span>
              </Link>
            </li>
          ) : null,
        )}
      </ul>
    </section>
  )
}

export const HomePage = () => {
  const { t } = useStorefront()
  const chosen = useProductCards(lookOrder)
  const all = useProducts({ sort: 'newest', first: 24 })
  // `first: 20` matches the layout's request, so both share one answer.
  const { collections } = useCollections({ first: 20 })
  // The named products first, in the home page's order, then anything newer the store has added since.
  const named = lookOrder.map((slug) => find(chosen.cards, slug)).filter((c): c is Card => c !== undefined)
  const rest = all.products.filter((p) => !named.some((n) => n.id === p.id))
  const cards = [...named, ...rest]
  const ready = chosen.status !== 'loading' && all.status !== 'loading'
  const heroLead = find(cards, slugs.mirror) ?? cards[0]
  const heroSecond = find(cards, slugs.cardBar) ?? cards.find((c) => c.id !== heroLead?.id)
  const introCard = find(cards, slugs.stop) ?? cards.find((c) => c.id !== heroLead?.id && c.id !== heroSecond?.id)
  const collectionsHref = collections[0]?.href ?? '/collections/all/'
  // Each story's words describe one product, so a story shows only when that product is in the catalogue.
  const storyOf = (slug: string, text: string): Story[] => {
    const card = find(cards, slug)
    return card ? [{ card, text }] : []
  }
  const stories = [...storyOf(slugs.bowl, t('home.story.bowl')), ...storyOf(slugs.chess, t('home.story.chess')), ...storyOf(slugs.stop, t('home.story.stop'))]
  return (
    <Layout>
      <Hero lead={heroLead} second={heroSecond} ready={ready} collectionsHref={collectionsHref} />
      <Intro card={introCard} />
      <Stories stories={stories} />
      <Look cards={cards} />
    </Layout>
  )
}
