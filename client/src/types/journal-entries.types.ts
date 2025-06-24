// TipTap JSON content structure
export interface TipTapContent {
  type: string;
  content?: TipTapContent[];
  attrs?: Record<string, unknown>;
  text?: string;
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
  }>;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  title?: string;
  content: TipTapContent; // TipTap JSON format
  created_at: string;
  updated_at: string;
}

export interface JournalEntryCreate {
  title?: string;
  content: TipTapContent; // TipTap JSON format
}

export interface JournalEntryUpdate {
  title?: string;
  content?: TipTapContent; // TipTap JSON format
}