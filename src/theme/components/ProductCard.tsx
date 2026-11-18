import { Image, Link, Price, useStorefront, type ProductCard as Card } from '@dripfunnel/storefront-core/theme'
import { WishlistHeart } from './interactive/WishlistHeart'
import styles from '../styles/shop.module.css'

/** A product as the shop lists it: a large picture with the wishlist heart over it, then its name, price and a way in. */
export const ProductCard = ({ product }: { product: Card }) => {
  const { store, locale, t } = useStorefront()
  return (
    <article className={styles.card}>
      <div className={styles.cardPicture}>
        <Link href={product.href} className={styles.cardImageLink}>
          {product.photo ? <Image image={product.photo} alt={product.photo.alt ?? product.name} ratio={0.8} sizes="(min-width: 1024px) 25vw, 50vw" className={styles.cardImage} /> : <span className={styles.noPicture}>{t('shop.card.noPicture')}</span>}
        </Link>
        {product.badges[0] ? <span className={styles.badge}>{product.badges[0].label}</span> : null}
        {product.stock.inStock ? null : <span className={styles.soldOut}>{t('shop.card.soldOut')}</span>}
        <div className={styles.cardWish}>
          <WishlistHeart productId={product.id} name={product.name} versionId={null} onCard />
        </div>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardName}>
          <Link href={product.href} className={styles.cardLink}>
            {product.name}
          </Link>
        </h3>
        {product.price ? (
          <p className={styles.cardPrice}>
            {product.from ? <span className={styles.from}>{t('shop.card.from')}</span> : null}
            <Price money={product.price} compareAt={product.compareAt} includesTax={store.pricesIncludeTax} locale={locale} t={t} className={styles.price} />
          </p>
        ) : null}
      </div>
    </article>
  )
}

export const ProductGrid = ({ products, wide = false }: { products: readonly Card[]; wide?: boolean }) => (
  <ul className={wide ? styles.gridWide : styles.grid}>
    {products.map((p) => (
      <li key={p.id} className={styles.cell}>
        <ProductCard product={p} />
      </li>
    ))}
  </ul>
)

/** The grid's shape while its products load, so nothing moves when they arrive. */
export const GridPlaceholder = ({ label, count }: { label: string; count: number }) => (
  <ul className={styles.grid} aria-busy="true" aria-label={label}>
    {[...Array(count).keys()].map((i) => (
      <li key={i} className={styles.cell}>
        <div className={styles.skeletonPicture} />
        <div className={styles.skeletonLine} />
      </li>
    ))}
  </ul>
)
