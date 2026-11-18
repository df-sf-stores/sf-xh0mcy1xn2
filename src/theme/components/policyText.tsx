import type { ReactNode } from 'react'
import { Link } from '@dripfunnel/storefront-core/theme'

/**
 * The text format of content/{language}/policies.json bodies. Blocks are split by a blank line:
 *   ## Section title ::anchor   a numbered section (the anchor is optional)
 *   ### Sub-heading
 *   - item / 1. item             a bulleted or numbered list
 *   > ! Label                     a highlighted note: its first line names it, each following "> " line is a paragraph
 *   anything else                 a paragraph; a single line break inside it is kept
 * Inside any line: **bold**, *italic*, ***both*** and [words](/a/store/path).
 */
export type Block =
  | { kind: 'h3'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'note'; label: string; lines: string[] }

export type Section = { id: string; title: string; blocks: Block[] }

const numbered = /^\d+\.\s/

const block = (raw: string): Block => {
  const lines = raw.split('\n')
  if (raw.startsWith('### ')) return { kind: 'h3', text: raw.slice(4) }
  if (lines.every((l) => l.startsWith('- '))) return { kind: 'ul', items: lines.map((l) => l.slice(2)) }
  if (lines.every((l) => numbered.test(l))) return { kind: 'ol', items: lines.map((l) => l.replace(numbered, '')) }
  if (lines.every((l) => l.startsWith('> '))) {
    const [first = '', ...rest] = lines.map((l) => l.slice(2))
    return first.startsWith('! ') ? { kind: 'note', label: first.slice(2), lines: rest } : { kind: 'note', label: '', lines: [first, ...rest] }
  }
  return { kind: 'p', text: raw }
}

/** The opening blocks before the first section, and the sections, each with an anchor for the contents list. */
export const parsePolicy = (text: string): { lead: Block[]; sections: Section[] } => {
  const lead: Block[] = []
  const sections: Section[] = []
  for (const raw of text.split('\n\n').map((b) => b.trim()).filter(Boolean)) {
    if (raw.startsWith('## ')) {
      const [title = '', anchor] = raw.slice(3).split(' ::')
      sections.push({ id: anchor?.trim() || `section-${sections.length + 1}`, title: title.trim(), blocks: [] })
    } else {
      const last = sections[sections.length - 1]
      ;(last ? last.blocks : lead).push(block(raw))
    }
  }
  return { lead, sections }
}

const token = /(\*\*\*[^*]+?\*\*\*|\*\*.+?\*\*|\*[^*\s][^*]*?\*|\[[^\]]+\]\([^)\s]+\))/

/** One line of policy text with its bold, italics and links. */
export const Rich = ({ text, className }: { text: string; className?: string | undefined }): ReactNode => {
  const parts = text.split(token).filter((p) => p !== '')
  return parts.map((part, i) => {
    if (part.startsWith('***') && part.endsWith('***') && part.length > 6)
      return (
        <strong key={i}>
          <em>{part.slice(3, -3)}</em>
        </strong>
      )
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
      return (
        <strong key={i}>
          <Rich text={part.slice(2, -2)} className={className} />
        </strong>
      )
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part)
    if (link)
      return (
        <Link key={i} href={link[2] ?? '/'} className={className}>
          {link[1]}
        </Link>
      )
    return part
  })
}
