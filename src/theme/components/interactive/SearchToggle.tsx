'use client'

import { useRef, useState } from 'react'
import { navigate, SearchField } from '@dripfunnel/storefront-core/theme'
import styles from '../../styles/layout.module.css'

// The theme rules allow no URL encoding, so the characters that would break the query are dropped instead.
const searchFor = (words: string) => navigate(`/search/?q=${words.replace(/[&+%#]/g, ' ').trim()}`)

type Labels = { open: string; close: string; search: string; prompt: string }

/** The header's magnifier: opens a search bar under the header, with core's suggestions as the shopper types. */
export const SearchToggle = ({ labels }: { labels: Labels }) => {
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  return (
    <>
      <button ref={toggle} type="button" className={styles.tool} aria-expanded={open} aria-controls="site-search" aria-label={open ? labels.close : labels.open} onClick={() => setOpen(!open)}>
        <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M10.5 17a6.5 6.5 0 100-13 6.5 6.5 0 000 13zM15.5 15.5L20 20" />}
        </svg>
      </button>
      <div
        id="site-search"
        className={open ? styles.searchPanelOpen : styles.searchPanel}
        onKeyDown={(e) => {
          if (e.key !== 'Escape') return
          setOpen(false)
          toggle.current?.focus()
        }}
      >
        <div className={styles.searchInner}>
          <SearchField label={labels.search} placeholder={labels.prompt} button={labels.search} value="" onSearch={searchFor} suggest={4} className={styles.search} />
        </div>
      </div>
    </>
  )
}
