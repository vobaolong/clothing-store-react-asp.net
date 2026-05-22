import React from 'react'

export const titleNode = (
  title: string,
  align: 'left' | 'center' | 'right' = 'left'
) => React.createElement('div', { style: { textAlign: align } }, title)

export const toCapitalize = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const spaced = trimmed
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')

  return spaced.replace(
    /(?:^|\s)(\p{L})/gu,
    (match, letter: string) =>
      match.slice(0, -1) + letter.toLocaleUpperCase('vi-VN')
  )
}
