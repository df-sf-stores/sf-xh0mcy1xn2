'use client'

import { useId, useState } from 'react'
import { Link, useLocation } from '@dripfunnel/storefront-core/theme'
import { cx } from '../cx'
import type { InfoLink } from './InfoMenu'
import styles from '../../styles/layout.module.css'

/** A heading in the phone menu that a tap opens to show its links, such as Shop all and the collections. */
export const DrawerGroup = ({ label, links }: { label: string; links: InfoLink[] }) => {
  const [open, setOpen] = useState(false)
  const id = useId()
  const { path } = useLocation()
  return (
    <div className={styles.drawerGroup}>
      <button
        type="button"
        className={styles.drawerToggle}
        aria-expanded={open}
        aria-controls={id}
        onClick={(e) => {
          // The menu around it closes on a press inside it; opening this group isn't a choice yet.
          e.stopPropagation()
          setOpen(!open)
        }}
      >
        {label}
        <svg className={cx(styles.drawerCaret, open && styles.caretOpen)} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div id={id} className={open ? styles.drawerListOpen : styles.drawerList}>
        {links.map((link) => (
          <span key={link.key} className={link.href === path ? styles.infoItemOn : styles.infoItem}>
            <Link href={link.href} className={styles.drawerSub}>
              {link.label}
            </Link>
          </span>
        ))}
      </div>
    </div>
  )
}
