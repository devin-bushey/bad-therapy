export type JournalEntry = {
  id: string
  title?: string
  content: object // TipTap JSON content
  created_at: string
  updated_at: string
}