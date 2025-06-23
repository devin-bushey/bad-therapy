export interface JournalEntry {
  id: string;
  user_id: string;
  title?: string;
  content: any; // TipTap JSON format
  created_at: string;
  updated_at: string;
}

export interface JournalEntryCreate {
  title?: string;
  content: any; // TipTap JSON format
}

export interface JournalEntryUpdate {
  title?: string;
  content?: any; // TipTap JSON format
}