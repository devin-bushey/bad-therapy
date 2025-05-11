export type Message = { content: string; isFromUser: boolean }

export type TherapySession = { id: string; name?: string; messages?: Message[]; created_at: string }