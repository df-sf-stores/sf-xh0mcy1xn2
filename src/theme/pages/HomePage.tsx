import { Image, Link, Price, useCollections, useListing, useProductCards, useProducts, useStorefront, type CollectionCard, type ProductCard as Card } from '@dripfunnel/storefront-core/theme'
import { Layout } from '../components/Layout'
import { ProductCard } from '../components/ProductCard'
import { cx } from '../components/cx'
import { slugOf } from '../components/slugOf'
import shop from '../styles/shop.module.css'
import styles from '../styles/home.module.css'

/** The store's own products, by the address the catalogue gives them, in the order the home page tells their story. */
const slugs = {
  mirror: 'blue-mirror-spectacular',
  stop: 'cant-stop-wont-stop',
  cardBar: 'card-bar',
  bowl: 'cement-hold-thy-heart-bowl',
  chess: 'checkmate-chessboard-hanger',
} as const
const featuredOrder: readonly string[] = [slugs.mirror, slugs.stop, slugs.cardBar, slugs.bowl, slugs.chess]

const slugOfCard = (card: Card) => card.href.replace(/\/$/, '').split('/').pop() ?? ''
const find = (cards: readonly Card[], slug: string) => cards.find((c) => slugOfCard(c) === slug)

const Arrow = ({ className }: { className?: string }) => (
  <svg className={className ?? styles.arrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
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

const CardPrice = ({ card, className }: { card: Card; className: string | undefined }) => {
  const { store, locale, t } = useStorefront()
  if (!card.price) return null
  return (
    <p className={className}>
      {card.from ? <span>{t('shop.card.from')} </span> : null}
      <Price money={card.price} compareAt={card.compareAt} includesTax={store.pricesIncludeTax} locale={locale} t={t} className={styles.price} />
    </p>
  )
}

/** 1 · A split editorial hero: the headline on the left, two products at different sizes on the right. */
const Hero = ({ lead, second, ready }: { lead: Card | undefined; second: Card | undefined; ready: boolean }) => {
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
            {lead ? (
              <Link href={lead.href} className={styles.outline}>
                {t('home.hero.mirrors')}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
      <div className={styles.heroArt} aria-busy={!ready}>
        <h2 className={styles.hidden}>{t('home.hero.pictures')}</h2>
        {figures.length === 0 ? <div className={styles.heroHold} /> : null}
        {figures.map((card, index) => (
          <Link key={card.id} href={card.href} className={index === 0 ? styles.heroMain : styles.heroSide}>
            <span className={index === 0 ? styles.heroFrame : styles.heroFrameSide}>
              {card.photo ? <Image image={card.photo} alt={card.photo.alt ?? card.name} ratio={index === 0 ? 0.8 : 1} sizes={index === 0 ? '(min-width: 1024px) 30vw, 60vw' : '(min-width: 1024px) 14vw, 36vw'} className={index === 0 ? styles.cover : styles.contain} /> : null}
            </span>
            <span className={styles.caption}>
              <span className={styles.captionNumber}>{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.captionName}>{card.name}</span>
              <Corner />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

/** 2 · The brand in a line, beside a large product photograph. */
const Intro = ({ card }: { card: Card | undefined }) => {
  const { t, store } = useStorefront()
  return (
    <section className={styles.intro}>
      <div className={styles.introInner}>
        <div className={styles.introCopy}>
          <Eyebrow>{t('home.intro.eyebrow', { store: store.name })}</Eyebrow>
          <h2 className={styles.display}>
            {t('home.intro.title')} <span className={styles.red}>{t('home.intro.accent')}</span>
          </h2>
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
    </section>
  )
}

/** One collection: its first product's picture, or its number set large while it has none. */
const CollectionTile = ({ collection, index }: { collection: CollectionCard; index: number }) => {
  const { t } = useStorefront()
  const listing = useListing({ collection: slugOf(collection) })
  const photo = collection.image ?? listing.items.find((p) => p.photo)?.photo ?? null
  const count = listing.items.length
  return (
    <li className={styles.collection}>
      <Link href={collection.href} className={styles.collectionLink}>
        <span className={photo ? styles.collectionFrame : styles.collectionFrameEmpty}>
          {photo ? (
            <Image image={photo} alt="" ratio={0.8} sizes="(min-width: 1024px) 33vw, 100vw" className={styles.cover} />
          ) : (
            <span className={styles.collectionNumber} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
          )}
        </span>
        <span className={styles.collectionText}>
          <span className={styles.collectionName}>{collection.name}</span>
          <span className={styles.collectionMeta}>
            {listing.status === 'ready' ? t('home.collections.count', { count }) : null}
            <span className={styles.collectionMore}>
              {t('home.collections.explore')}
              <Arrow />
            </span>
          </span>
        </span>
      </Link>
    </li>
  )
}

/** 3 · The store's collections, as they are in the catalogue. */
const Collections = () => {
  const { t } = useStorefront()
  const { collections, status } = useCollections({ first: 20 })
  if (status !== 'loading' && !collections.length) return null
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <div>
          <Eyebrow>{t('home.collections.eyebrow')}</Eyebrow>
          <h2 className={styles.display}>{t('home.collections.title')}</h2>
        </div>
      </div>
      <ul className={styles.collections} aria-busy={status === 'loading'}>
        {collections.map((c, index) => (
          <CollectionTile key={c.id} collection={c} index={index} />
        ))}
      </ul>
    </section>
  )
}

/** 4 · The mirror, large, with its name, price and a way in. */
const Mirrors = ({ card }: { card: Card | undefined }) => {
  const { t, store } = useStorefront()
  if (!card) return null
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <div>
          <Eyebrow>{t('home.mirrors.eyebrow', { store: store.name })}</Eyebrow>
          <h2 className={styles.display}>{t('home.mirrors.title')}</h2>
        </div>
      </div>
      <div className={styles.mirror}>
        <Link href={card.href} className={styles.mirrorPicture}>
          <span className={styles.mirrorFrame}>{card.photo ? <Image image={card.photo} alt={card.photo.alt ?? card.name} ratio={0.8} sizes="(min-width: 1024px) 45vw, 100vw" className={styles.cover} /> : null}</span>
        </Link>
        <div className={styles.mirrorCopy}>
          <h3 className={styles.mirrorName}>{card.name}</h3>
          <CardPrice card={card} className={styles.mirrorPrice} />
          <p className={styles.body}>{t('home.mirrors.lead')}</p>
          <Link href={card.href} className={styles.textLink}>
            {t('home.mirrors.view')}
            <Arrow />
          </Link>
        </div>
      </div>
    </section>
  )
}

/** 5 · Every product in an editorial grid: the first one large, the rest beside it. */
const Featured = ({ cards, pending }: { cards: Card[]; pending: boolean }) => {
  const { t } = useStorefront()
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <div>
          <Eyebrow>{t('home.featured.eyebrow')}</Eyebrow>
          <h2 className={styles.display}>{t('home.featured.title')}</h2>
        </div>
        {cards.length ? (
          <Link href="/collections/all/" className={styles.textLink}>
            {t('home.featured.viewAll')}
            <Arrow />
          </Link>
        ) : null}
      </div>
      {pending && !cards.length ? (
        <ul className={styles.featured} aria-busy="true" aria-label={t('shop.listing.loading')}>
          {[0, 1, 2, 3, 4].map((i) => (
            <li key={i} className={styles.featuredItem}>
              <div className={shop.skeletonPicture} />
            </li>
          ))}
        </ul>
      ) : cards.length ? (
        <ul className={styles.featured}>
          {cards.map((card) => (
            <li key={card.id} className={styles.featuredItem}>
              <ProductCard product={card} />
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{t('home.featured.empty')}</p>
      )}
    </section>
  )
}

type Story = { card: Card; text: string }

/** 6 · Products told one at a time, picture and words alternating sides. */
const Stories = ({ stories }: { stories: Story[] }) => {
  const { t } = useStorefront()
  if (!stories.length) return null
  return (
    <section className={styles.stories}>
      <div className={styles.storiesInner}>
        <div className={styles.head}>
          <div>
            <Eyebrow>{t('home.story.eyebrow')}</Eyebrow>
            <h2 className={styles.display}>
              {t('home.story.title')} <span className={styles.red}>{t('home.story.accent')}</span>
            </h2>
          </div>
        </div>
        <ol className={styles.storyList}>
          {stories.map(({ card, text }, index) => (
            <li key={card.id} className={cx(styles.story, index % 2 === 1 && styles.storyFlip)}>
              <Link href={card.href} className={styles.storyPicture}>
                <span className={styles.storyFrame}>{card.photo ? <Image image={card.photo} alt={card.photo.alt ?? card.name} ratio={1} sizes="(min-width: 1024px) 45vw, 100vw" className={styles.cover} /> : null}</span>
              </Link>
              <div className={styles.storyCopy}>
                <span className={styles.storyNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className={styles.storyName}>{card.name}</h3>
                <p className={styles.body}>{text}</p>
                <CardPrice card={card} className={styles.storyPrice} />
                <Link href={card.href} className={styles.textLink}>
                  {t('home.story.view')}
                  <Arrow />
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/** 7 · A gallery of the products' pictures at different proportions, each a link to its product. */
const Look = ({ cards }: { cards: Card[] }) => {
  const { t, store } = useStorefront()
  const instagram = store.social.find((s) => s.network === 'instagram')
  const pictured = cards.filter((c) => c.photo).slice(0, 5)
  if (!pictured.length) return null
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.display}>{t('home.look.title')}</h2>
        {instagram ? (
          <Link href={instagram.url} className={styles.textLink}>
            {t('home.look.instagram')}
            <Corner />
          </Link>
        ) : null}
      </div>
      <ul className={styles.look}>
        {pictured.map((card) =>
          card.photo ? (
            <li key={card.id} className={styles.lookItem}>
              <Link href={card.href} className={styles.lookLink}>
                <Image image={card.photo} alt={t('home.look.view', { name: card.name })} ratio={1} sizes="(min-width: 1024px) 25vw, 50vw" className={styles.cover} />
                <span className={styles.lookName} aria-hidden="true">
                  {card.name}
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
  const chosen = useProductCards(featuredOrder)
  const all = useProducts({ sort: 'newest', first: 24 })
  // The named products first, in the home page's order, then anything newer the store has added since.
  const named = featuredOrder.map((slug) => find(chosen.cards, slug)).filter((c): c is Card => c !== undefined)
  const rest = all.products.filter((p) => !named.some((n) => n.id === p.id))
  const cards = [...named, ...rest]
  const ready = chosen.status !== 'loading' && all.status !== 'loading'
  const mirror = find(cards, slugs.mirror)
  const stop = find(cards, slugs.stop)
  const heroLead = mirror ?? cards[0]
  const heroSecond = stop ?? cards.find((c) => c.id !== heroLead?.id)
  const introCard = find(cards, slugs.cardBar) ?? cards.find((c) => c.id !== heroLead?.id && c.id !== heroSecond?.id)
  // Each story's words describe one product, so a story shows only when that product is in the catalogue.
  const storyOf = (slug: string, text: string): Story[] => {
    const card = find(cards, slug)
    return card ? [{ card, text }] : []
  }
  const stories = [...storyOf(slugs.bowl, t('home.story.bowl')), ...storyOf(slugs.chess, t('home.story.chess')), ...storyOf(slugs.stop, t('home.story.stop'))]
  return (
    <Layout>
      <Hero lead={heroLead} second={heroSecond} ready={ready} />
      <Intro card={introCard} />
      <Collections />
      <Mirrors card={mirror} />
      <Featured cards={cards.slice(0, 8)} pending={!ready} />
      <Stories stories={stories} />
      <Look cards={cards} />
    </Layout>
  )
}
