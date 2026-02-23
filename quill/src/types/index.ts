export type Document = {
  id: string
  title: string
  body: string
  createdAt: number
  updatedAt: number
}

export type SubscriptionStatus = 'free' | 'pro'

export type AIAction = {
  id: string
  label: string
  description: string
  icon: string
}

export const AI_ACTIONS: AIAction[] = [
  {
    id: 'improve',
    label: 'Improve Writing',
    description: 'Refine clarity, flow, and tone',
    icon: '✦',
  },
  {
    id: 'summarize',
    label: 'Summarize',
    description: 'Condense into key points',
    icon: '◈',
  },
  {
    id: 'rephrase',
    label: 'Rephrase',
    description: 'Rewrite with fresh wording',
    icon: '↻',
  },
  {
    id: 'expand',
    label: 'Expand',
    description: 'Add depth and detail',
    icon: '⊕',
  },
  {
    id: 'fix',
    label: 'Fix Grammar',
    description: 'Correct spelling and grammar',
    icon: '✓',
  },
]

export const FREE_DAILY_LIMIT = 3
