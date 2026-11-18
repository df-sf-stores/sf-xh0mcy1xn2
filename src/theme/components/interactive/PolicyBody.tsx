'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { useReducedMotion, useScrollProgress } from '@dripfunnel/storefront-core/theme'
import { Rich, type Block, type Section } from '../policyText'
import { cx } from '../cx'
import styles from '../../styles/policy.module.css'

/** Where under the sticky header a section counts as the one being read. */
const readingLine = 140

const Blocks = ({ blocks }: { blocks: Block[] }) => (
  <>
    {blocks.map((b, i) => {
      if (b.kind === 'h3')
        return (
          <h3 key={i} className={styles.subheading}>
            <Rich text={b.text} className={styles.inlineLink} />
          </h3>
        )
      if (b.kind === 'ul' || b.kind === 'ol') {
        const items = b.items.map((item, j) => (
          <li key={j}>
            <Rich text={item} className={styles.inlineLink} />
          </li>
        ))
        return b.kind === 'ul' ? (
          <ul key={i} className={styles.list}>
            {items}
          </ul>
        ) : (
          <ol key={i} className={styles.list}>
            {items}
          </ol>
        )
      }
      if (b.kind === 'note')
        return (
          <aside key={i} className={styles.note}>
            {b.label ? (
              <p className={styles.noteLabel}>
                <Rich text={b.label} />
              </p>
            ) : null}
            {b.lines.map((line, j) => (
              <p key={j} className={styles.noteText}>
                <Rich text={line} className={styles.inlineLink} />
              </p>
            ))}
          </aside>
        )
      return <Paragraph key={i} text={b.text} />
    })}
  </>
)

/** A paragraph keeps a single line break, as an address block does. */
const Paragraph = ({ text }: { text: string }) => {
  const lines: string[] = text.split('\n')
  return (
    <p className={styles.paragraph}>
      {lines.map((line: string, j: number) => (
        <Fragment key={j}>
          {j > 0 ? <br /> : null}
          <Rich text={line} className={styles.inlineLink} />
        </Fragment>
      ))}
    </p>
  )
}

type Labels = { contents: string; show: string; hide: string }

/**
 * A written policy: its opening, then numbered sections, with a contents list that stays beside the text on wide
 * screens, marks the section being read, and scrolls smoothly to a chosen one. On phones the list folds into a menu.
 */
export const PolicyBody = ({ lead, sections, labels }: { lead: Block[]; sections: Section[]; labels: Labels }) => {
  const reduced = useReducedMotion()
  const progress = useScrollProgress()
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const anchors = useRef<(HTMLElement | null)[]>([])
  const headings = useRef<(HTMLHeadingElement | null)[]>([])
  const withContents = sections.length >= 3

  // On every scroll, the last section whose top has passed the reading line is the one being read.
  useEffect(() => {
    let current = 0
    anchors.current.forEach((el, i) => {
      if (el && el.getBoundingClientRect().top <= readingLine) current = i
    })
    setActive(current)
  }, [progress])

  // The phone menu folds first, then the page scrolls, so the text doesn't move up under the scroll and overshoot.
  const [target, setTarget] = useState<number | null>(null)
  useEffect(() => {
    if (target === null || open) return
    anchors.current[target]?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    // Keyboard and screen-reader users land on the section too, not just the eye.
    headings.current[target]?.focus({ preventScroll: true })
    setTarget(null)
  }, [target, open, reduced])

  const go = (index: number) => {
    setOpen(false)
    setTarget(index)
  }

  const list = (
    <ol className={styles.contentsList}>
      {sections.map((s, i) => (
        <li key={s.id}>
          <button type="button" className={cx(styles.contentsLink, i === active && styles.contentsLinkOn)} aria-current={i === active ? 'location' : undefined} onClick={() => go(i)}>
            <span className={styles.contentsNumber} aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            {s.title}
          </button>
        </li>
      ))}
    </ol>
  )

  return (
    <div className={withContents ? styles.bodyWithContents : styles.body}>
      {withContents ? (
        <>
          <nav className={styles.contents} aria-label={labels.contents}>
            <p className={styles.contentsTitle}>{labels.contents}</p>
            {list}
          </nav>
          <nav className={styles.contentsMobile} aria-label={labels.contents}>
            <button type="button" className={styles.contentsToggle} aria-expanded={open} onClick={() => setOpen(!open)}>
              <span>{labels.contents}</span>
              <span className={styles.contentsToggleState}>{open ? labels.hide : labels.show}</span>
            </button>
            {open ? list : null}
          </nav>
        </>
      ) : null}
      <article className={styles.article}>
        {lead.length ? (
          <div className={styles.lead}>
            <Blocks blocks={lead} />
          </div>
        ) : null}
        {sections.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            ref={(el) => {
              anchors.current[i] = el
            }}
            className={styles.section}
            aria-labelledby={`${s.id}-title`}
          >
            <h2
              id={`${s.id}-title`}
              ref={(el) => {
                headings.current[i] = el
              }}
              tabIndex={-1}
              className={styles.heading}
            >
              <span className={styles.number} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{s.title}</span>
            </h2>
            <Blocks blocks={s.blocks} />
          </section>
        ))}
      </article>
    </div>
  )
}
