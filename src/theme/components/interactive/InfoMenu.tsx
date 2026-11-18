'use client'

import { useId, useRef, useState } from 'react'
import { Link, useLocation } from '@dripfunnel/storefront-core/theme'
import { cx } from '../cx'
import styles from '../../styles/layout.module.css'

export type InfoLink = { key: string; label: string; href: string }

type DropdownProps = {
  label: string
  links: InfoLink[]
  /** Which edge of the toggle the panel lines up with: `start` under a left-hand menu, `end` under the tools. */
  align?: 'start' | 'end'
  className?: string | undefined
}

/**
 * A header dropdown: opens on hover, focus or press; closes on Escape, when focus or the pointer leaves, or once a
 * link in it is chosen. The link for the page being shown is marked as the current one.
 */
export const InfoMenu = ({ label, links, align = 'end', className }: DropdownProps) => {
  const [open, setOpen] = useState(false)
  const id = useId()
  const { path } = useLocation()
  const toggle = useRef<HTMLButtonElement>(null)
  const leaving = useRef<ReturnType<typeof setTimeout>>(undefined)
  const show = (value: boolean) => {
    clearTimeout(leaving.current)
    setOpen(value)
  }
  const current = links.some((link) => link.href === path)
  return (
    <div
      className={cx(styles.info, className)}
      onKeyDown={(e) => {
        if (e.key !== 'Escape' || !open) return
        show(false)
        toggle.current?.focus()
      }}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') show(true)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') show(false)
      }}
      onFocus={() => clearTimeout(leaving.current)}
      onBlur={() => {
        leaving.current = setTimeout(() => setOpen(false), 0)
      }}
    >
      <button ref={toggle} type="button" className={cx(styles.infoToggle, (open || current) && styles.infoToggleOn)} aria-expanded={open} aria-controls={id} onClick={() => show(!open)}>
        {label}
        <svg className={cx(styles.caret, open && styles.caretOpen)} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {/* A press on a link closes the panel; a pointer outside closes it as focus leaves. */}
      <div id={id} className={open ? cx(styles.infoPanelOpen, align === 'start' && styles.infoPanelStart) : styles.infoPanel} onClick={() => show(false)}>
        {links.map((link) => (
          <span key={link.key} className={link.href === path ? styles.infoItemOn : styles.infoItem}>
            <Link href={link.href} className={styles.infoLink}>
              {link.label}
            </Link>
          </span>
        ))}
      </div>
    </div>
  )
}
