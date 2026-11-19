# The Niche Store: website audit

Date: 19 November 2026 · Sites tested: local `next dev` at `http://localhost:3000/` and the live store at
`https://the-niche-store.my-store.one/` · Browser: Chrome, desktop (1280 px) and mobile (375 px) widths.

Testing was read-only. No sign-in, no form submissions, no orders or payments, no changes to store data. Each page was
loaded once per check. The API monitor made one query per minute.

## Summary

| # | Finding | Where | Severity | Status |
|---|---------|-------|----------|--------|
| 1 | Local pages other than the homepage reload in a loop and show a blank screen (the reported Privacy Policy issue) | Local `next dev` only | High (blocks local preview) | Root cause found. Needs a dev server restart; see §1 |
| 2 | Privacy Policy has no policy text: it shows "This policy is being finalised" | Live and local | High (legal page) | Needs the store's privacy policy text; see §2 |
| 3 | Shop API answers slowly and unevenly: cart ≈ 6 s, search ≈ 3.6–4.1 s, other queries 0.8–6.9 s | Live (platform API) | Medium | Platform side; the theme already shows loading states. See §3 |
| 4 | Homepage "Shop the look" large tile was served at 370 px but shown at 580 px (soft image) | Live (current homepage) | Low | Fixed in the unpushed homepage redesign (`sizes` corrected) |
| 5 | No web font is loaded: the theme asks for Inter, so visitors without Inter installed see the system font | Live | Low | Platform font setting; see §5 |
| 6 | Card Bar and Can't Stop Wont Stop show each other's photos | Live and local (store data) | Medium | Fix the photo sets in the admin |
| 7 | Every local API call takes an extra 308 redirect (`/shop-api` → `/shop-api/`) | Local only | Low | Not changed: `store.config.ts` and `next.config.ts` are platform files |

No page on the live site is blank, returns a 404 when it shouldn't, loads forever, or throws an uncaught JavaScript
error. Every data page has a loading, empty, error-with-retry and ready state.

## 1. Blank local pages (Privacy Policy and others)

**Symptom.** `http://localhost:3000/policies/privacy/` (and `/collections/all/`, `/policies/shipping/`, product pages)
stays white. The tab reloads every 1–3 seconds, so the page never gets as far as rendering.

**Root cause, step by step (checked with the browser and the Next.js dev log):**

1. Locally, every address except `/` is served by the dev-only catch-all route `src/app/[...path]/page.dev.ts`. It imports
   every page of the theme into one chunk list (`static/chunks/_1c7urax8o-gre._.js`).
2. Whenever Turbopack rebuilds, it sends the browser a `turbopack-message` of type **`restart`** for that chunk list.
   Captured from the HMR socket:
   `{"type":"turbopack-message","data":[{"resource":{"path":"static/chunks/_1c7urax8o-gre._.js"},"type":"restart"}]}`.
   The Turbopack runtime answers `restart` with `location.reload()`.
3. Each reload requests the page again, which triggers another rebuild (`✓ Compiled in 2ms`), which sends `restart` to
   every open tab on that route. Several open tabs (privacy, shipping, collections) kept each other reloading. The dev log
   has about 16,000 of these rebuilds since 10:17 with no source file changing, and the HMR version climbed by about
   40 in 20 seconds.
4. The homepage (`src/app/page.tsx`) has its own small chunk list. It gets no-op updates, not `restart`, so it stays up.

**Contributing issue, fixed:** the Grammarly browser extension adds `data-gr-ext-installed` and
`data-new-gr-c-s-check-loaded` to `<body>`. That caused a hydration mismatch on every page (290 occurrences in the log),
which Next records as a runtime error, and with that error recorded Next also reloads on the next update.
`src/app/layout.tsx` now sets `suppressHydrationWarning` on `<html>` and `<body>`. The "1 Issue" badge is gone.

**What to do:** stop the dev server (Ctrl+C in its terminal), close the extra localhost tabs, then run `pnpm dev` again.
This clears Turbopack's state. If the loop comes back with a single tab open, delete the `.next` folder before starting.

**The live site is not affected:** it doesn't use the catch-all route, and its Privacy Policy page renders (see §2).

## 2. Privacy Policy content

The live page renders correctly but has no policy. `content/en/policies.json` has:

```json
"privacy": { "status": "pending", "body": "This policy will be published here soon. …" }
```

`PolicyPage` shows a "being finalised" notice with a Contact button while the status is `pending`. That's by design.
Refund, Shipping and Terms are published (3,000–9,300 characters each).

**To publish it:** put the store's privacy policy in `privacy.body` (the same `## Heading ::anchor` format the other
policies use) and set `status` to `"published"` or a date such as `"19 November 2026"`. This needs the store owner's own
policy. It wasn't written here, because a legal policy has to match what the business actually does with customer data.

## 3. Page-by-page results (live site)

The probe loaded each page in a same-origin frame and waited for its heading. It recorded content size, API calls, images
and any uncaught errors.

| Page / Route | HTTP | API calls (slowest) | Rendering | Images | Result |
|---|---|---|---|---|---|
| `/` Home | 200 | 2 (0.9 s) | Rendered 0.8 s | 23, 0 broken | Pass |
| `/collections/all/` Shop all | 200 | 0 extra | Rendered 1.3 s | 9, 0 broken | Pass |
| `/collections/home-decor-living/` | 200 | 3 (1.6 s) | Rendered 1.3 s | 6, 0 broken | Pass |
| `/collections/games-entertainment/` | 200 | 2 (0.8 s) | Rendered 1.0 s | 5, 0 broken | Pass |
| `/collections/statement-lifestyle/` | 200 | 3 (1.5 s) | Rendered 2.1 s | 6, 0 broken | Pass |
| `/products/blue-mirror-spectacular/` | 200 | 2 (0.8 s) | Rendered 0.7 s | 12, 0 broken | Pass |
| `/products/card-bar/` | 200 | 2 (0.8 s) | Rendered 1.8 s | 13, 0 broken | Pass (wrong photos, store data) |
| `/products/cant-stop-wont-stop/` | 200 | 2 (0.8 s) | Rendered 2.5 s | 11, 0 broken | Pass (wrong photos, store data) |
| `/products/cement-hold-thy-heart-bowl/` | 200 | 2 (0.8 s) | Rendered 1.6 s | 12, 0 broken | Pass |
| `/products/checkmate-chessboard-hanger/` | 200 | 2 (0.8 s) | Rendered 2.0 s | 12, 0 broken | Pass |
| `/products/no-such-product/` | 200 | 5 (6.4 s) | "Loading the product", then "We can't find that product" after about 6 s | 3 | Pass (slow API) |
| `/search/?q=mirror` | 200 | 5 (6.7 s); `Listing` 3.6–4.1 s | Heading at once, results after about 4 s | 3 + results | Pass (slow API) |
| `/search/?q=zzzz` | 200 | 3 (0.8 s) | Empty state | 3 | Pass |
| `/cart/` | 200 | 3 (6.3 s) | "Loading your cart", then the cart after about 6 s | 3 | Pass (slow API) |
| `/checkout/` | 200 | 2 (5.8 s) | Contact step after about 6 s | 1 | Pass (slow API) |
| `/sign-in/` | 200 | 3 (1.4 s) | Rendered 1.3 s | 3 | Pass |
| `/register/` | 200 | 2 (1.0 s) | Rendered 1.4 s | 3 | Pass |
| `/forgot-password/` | 200 | 3 (1.4 s) | Rendered 1.3 s | 3 | Pass |
| `/account/` | 200 | 3 (1.5 s) | Signed out: sends you to `/sign-in/` | 3 | Pass |
| `/account/orders/` (My orders) | 200 | 3 (1.5 s) | Signed out: sends you to `/sign-in/` | 3 | Pass |
| `/account/wishlist/` | 200 | 3 (1.4 s) | Signed out: sends you to `/sign-in/` | 3 | Pass |
| `/account/addresses/` | 200 | 3 (1.5 s) | Signed out: sends you to `/sign-in/` | 3 | Pass |
| `/about/` | 200 | 2 (0.8 s) | Rendered 1.1 s | 3 | Pass |
| `/contact/` | 200 | 2 (0.8 s) | Rendered 0.5 s | 3 | Pass |
| `/help/` FAQs | 200 | 2 (0.9 s) | Rendered 1.9 s | 3 | Pass |
| `/policies/privacy/` | 200 | 2 (1.4 s) | "Being finalised" notice | 3 | Pass (content missing, §2) |
| `/policies/returns/` | 200 | 2 (0.8 s) | Full policy | 3 | Pass |
| `/policies/shipping/` | 200 | 2 (0.8 s) | Full policy | 3 | Pass |
| `/policies/terms/` | 200 | 2 (0.8 s) | Full policy | 3 | Pass |
| `/blog/` | 200 | 4 (6.9 s) | "Nothing here yet" empty state | 3 | Pass (nothing links to it) |
| `/this-page-does-not-exist/` | 200 | 2 (0.8 s) | "We can't find that page" | 3 | Pass |

**Not tested:** signed-in account pages (needs a real customer login), placing an order, payment, adding or removing
cart and wishlist items (they change data), order confirmation and verify/reset links (need real tokens). "Customer
Reviews" doesn't exist: there's no route for it in `routes.json` or core's route list.

**Mobile (375 px):** `/`, `/collections/all/`, a product page, search, cart and terms have no horizontal overflow. The
unpushed homepage redesign was also checked at 375 and 768 px with no overflow.

**Local pages:** the homepage renders. Other local addresses are affected by §1 until the dev server restarts.

## 4. API inventory

There is one endpoint, **`POST /shop-api`** (GraphQL), on the store's own host. Locally, `next dev` forwards it to the
live host (`.env.development` → `SHOP_API_PROXY`). Pictures load from `GET /shop-api/assets/{id}`. Requests carry
`x-shop-language`, `x-shop-currency`, `x-shop-cart` and `x-shop-session` headers; the public store key isn't sent. There
are no third-party APIs. The WhatsApp link is a plain link.

Operations used by core (from `@dripfunnel/storefront-core` 0.14.0):

| Area | Operations |
|---|---|
| Store and menu | `Store`, `Menu`, `Offers` |
| Catalogue | `Collections`, `Collection`, `Listing` (collections and search), `Product`, `Cards`, `Suggest` (search-as-you-type) |
| Content | `ContentPage`, `Blog`, `BlogPost` |
| Cart and checkout | `Cart`, `Questions`, `Quote`, `PaymentOptions`, `Instructions`; mutations `Add`, `Apply`, `RemoveCode`, `GiftCard`, `RemoveGiftCard`, `Checkout`, `Contact`, `Address`, `Delivery`, `Answers`, `Place`, `Pay`, `Confirm` |
| Account | `SignInOptions`, `Account`, `OrderHistory`; mutations `RequestCode`, `VerifyCode`, `SignIn`, `SignOut`, `SaveAddress`, `DeleteAddress`, `Rename`, `Order` |
| Wishlist | `WishlistIds`, `Wishlist`, `WishlistVersions`; mutations `AddToWishlist`, `RemoveFromWishlist` |

Measured (live, read-only): every response was HTTP 200 with a well-formed body and no `errors`. There were no CORS
errors, no requests blocked or cancelled on the live site, and none left pending past the page's own timeout.

| Operation | Typical | Slowest seen | Response size |
|---|---|---|---|
| Page HTML (`GET /`) | 0.24 s to first byte | see monitor | 8 KB |
| `Store` and other page-shell queries | 0.8 s | 2.6 s | small |
| `Listing` (search) | 3.6 s | 4.1 s | 0.8 KB |
| `Cart` (one item) | 5.8 s | 6.4 s | small |
| Slowest call on a page (blog, unknown product) | — | 6.9 s | small |

The cart and search queries are slow on the platform's side. A 0.8 KB answer taking four seconds isn't caused by the
network or the browser. Please raise it with DripFunnel support.

### Extended monitor (15 minutes)

One `Store` query and one homepage HTML request a minute, 15 s timeout.

Run 07:51–08:06 UTC, 15 samples:

| Request | Min | Median | 90th percentile | Max | Failures | Over 3 s |
|---|---|---|---|---|---|---|
| `POST /shop-api` `Store` (3 fields) | 2.11 s | 2.51 s | 3.32 s | 3.54 s | 0 / 15 | 5 / 15 |
| `GET /` page HTML | 0.18 s | 0.23 s | 0.29 s | 0.31 s | 0 / 15 | 0 / 15 |

The API never failed or timed out, but it was steadily slow. Even a three-field `Store` query never finished in under
2.1 s, while static HTML from the same host came back in about 0.2 s. So the delay is in the API's processing, not the
connection. (In the browser, page-shell queries were sometimes about 0.8 s, so the API's speed varies with load as well.)

## 5. Request handling, loading states and performance

**Already in place (platform core or theme):**
- Every API call has a 10 s timeout (`AbortSignal.timeout`), one shared error path (`ShopApiError` with codes such as
  `NETWORK`, `HTTP_5xx`, `BAD_RESPONSE`), and response shapes are checked with schemas before the theme sees them.
- Search-as-you-type is debounced in core (`suggest.js`). The search page only queries when you submit.
- The header and the homepage ask for collections with the same arguments (`first: 20`), so they share one answer
  instead of two requests.
- Every data page has loading, empty, error-with-retry and ready states: `CartView`, `ProductPage`, `CollectionPage`,
  `ListingResults`, `BlogView`, `PolicyPage`. Listings load more as you scroll.
- Images: platform-resized `srcset`, `decoding="async"`, lazy loading, and the product page's first photo loads eagerly
  with high priority.
- Page shell: 0.24 s to first byte, 0.4 s to DOM ready, 0.96 s to full load on the live homepage.

**Not added, on purpose:**
- **Retries with backoff or extra caching in the theme.** The API client is in platform core, which the theme can't
  change. Wrapping it in the theme would duplicate requests or hide errors the Retry buttons already handle.
- **Changes to `store.config.ts` and `next.config.ts`.** Both are platform-generated and locked.

**Platform requests (outside the theme):**
1. Speed up the `Cart` and `Listing` queries (§4).
2. Load the theme's font (Inter is on core's font allowlist, but no font file is served, so visitors get the system font).
3. Let themes mark a homepage hero image as the main picture (core's `asMain` isn't exported to themes), so the
   homepage's first image can load eagerly too.

## 6. Changes made in this audit

| File | Change |
|---|---|
| `src/app/layout.tsx` | `suppressHydrationWarning` on `<html>` and `<body>`, so browser-extension attributes no longer count as runtime errors in `next dev` (dev shell only; the live site is built by the platform) |
| `WEBSITE_AUDIT_REPORT.md` | This report |

The earlier homepage redesign (unpushed) also fixes finding 4. `pnpm check` passes.
