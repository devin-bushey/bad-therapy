export type Message = { content: string; type: 'human' | 'ai' | 'other' }

export type TherapySession = { id: string; name?: string; messages?: Message[]; created_at: string }