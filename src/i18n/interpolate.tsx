import { Fragment, type ReactNode } from 'react'

type Replacements = Record<string, ReactNode>

export const interpolateJsx = (template: string, replacements: Replacements): ReactNode => {
  const parts = template.split(/(\{\w+\})/g)
  return parts.map((part, i) => {
    const match = part.match(/^\{(\w+)\}$/)
    if (match && match[1] in replacements) {
      return <Fragment key={i}>{replacements[match[1]]}</Fragment>
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}
