'use client'

// next dev only (pageExtensions in next.config.ts), like theme-media/[name]/route.dev.ts: a production build never sees it.
// The live site is rendered by the platform from routes.json; locally, src/app/page.tsx serves only "/", so every
// other address 404s on a click or a refresh. This resolves an address the way the live site does — core's
// routeAddresses and contentAddresses, then routes.json's custom paths — and renders the page routes.json names.
import { createElement, use, type ComponentType } from 'react'
import { contentAddresses, routeAddresses } from '@dripfunnel/storefront-core'
import routes from '../../../routes.json'
import * as about from '../../theme/pages/AboutPage'
import * as cart from '../../theme/pages/CartPage'
import * as checkout from '../../theme/pages/CheckoutPage'
import * as collection from '../../theme/pages/CollectionPage'
import * as contact from '../../theme/pages/ContactPage'
import * as degraded from '../../theme/pages/DegradedPage'
import * as faq from '../../theme/pages/FaqPage'
import * as home from '../../theme/pages/HomePage'
import * as notFound from '../../theme/pages/NotFoundPage'
import * as confirmation from '../../theme/pages/OrderConfirmationPage'
import * as policy from '../../theme/pages/PolicyPage'
import * as product from '../../theme/pages/ProductPage'
import * as search from '../../theme/pages/SearchPage'
import * as account from '../../theme/pages/account/AccountPage'
import * as addresses from '../../theme/pages/account/AddressesPage'
import * as forgot from '../../theme/pages/account/ForgotPasswordPage'
import * as order from '../../theme/pages/account/OrderPage'
import * as orders from '../../theme/pages/account/OrdersPage'
import * as register from '../../theme/pages/account/RegisterPage'
import * as reset from '../../theme/pages/account/ResetPasswordPage'
import * as signIn from '../../theme/pages/account/SignInPage'
import * as verify from '../../theme/pages/account/VerifyPage'
import * as wishlist from '../../theme/pages/account/WishlistPage'
import * as blog from '../../theme/pages/content/BlogPage'
import * as blogPost from '../../theme/pages/content/BlogPostPage'
import * as contentPage from '../../theme/pages/content/ContentPage'

type Address = { page: string } | { prefix: string }

// Each page file's exports, by the name routes.json gives it.
const files: Record<string, Record<string, unknown>> = {
  AboutPage: about, CartPage: cart, CheckoutPage: checkout, CollectionPage: collection, ContactPage: contact, DegradedPage: degraded,
  FaqPage: faq, HomePage: home, NotFoundPage: notFound, OrderConfirmationPage: confirmation, PolicyPage: policy, ProductPage: product,
  SearchPage: search, 'account/AccountPage': account, 'account/AddressesPage': addresses, 'account/ForgotPasswordPage': forgot,
  'account/OrderPage': order, 'account/OrdersPage': orders, 'account/RegisterPage': register, 'account/ResetPasswordPage': reset,
  'account/SignInPage': signIn, 'account/VerifyPage': verify, 'account/WishlistPage': wishlist, 'content/BlogPage': blog,
  'content/BlogPostPage': blogPost, 'content/ContentPage': contentPage,
}

const component = (name: string | undefined): ComponentType | null => {
  if (!name) return null
  const exported = files[name]?.[name.split('/').pop() ?? name]
  return typeof exported === 'function' ? (exported as ComponentType) : null
}

const mapped = routes.routes as Record<string, string>
const known: [string, Address][] = [...Object.entries(routeAddresses), ...Object.entries(contentAddresses)]

/** The routes.json page for a path: an exact page first, then the longest prefix, then a custom path. */
const pageFor = (path: string): ComponentType | null => {
  const exact = known.find(([, a]) => 'page' in a && a.page === path)
  if (exact) return component(mapped[exact[0]])
  const prefixed = known.filter(([, a]) => 'prefix' in a && path.startsWith(a.prefix) && path.length > a.prefix.length).sort(([, a], [, b]) => ('prefix' in b ? b.prefix.length : 0) - ('prefix' in a ? a.prefix.length : 0))[0]
  if (prefixed) return component(mapped[prefixed[0]])
  const custom = (routes.custom as Record<string, string>)[path.replace(/\/$/, '')]
  if (custom) return component(custom)
  return component(mapped['contentPage'])
}

export default function DevRoute({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = use(params)
  const page = pageFor(`/${path.map(decodeURIComponent).join('/')}/`) ?? component(mapped['notFound'])
  return page ? createElement(page) : null
}
