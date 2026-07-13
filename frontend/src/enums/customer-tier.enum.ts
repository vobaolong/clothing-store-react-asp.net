export const CustomerTier = {
  BRONZE: 'Bronze',
  SILVER: 'Silver',
  GOLD: 'Gold',
  PLATINUM: 'Platinum',
  DIAMOND: 'Diamond'
} as const

export type CustomerTier = (typeof CustomerTier)[keyof typeof CustomerTier]
