export default function TypingBubble() {
  return (
    <div className="flex justify-start my-2">
      <span className="flex items-center bg-warm-200 border border-warm-300 rounded-2xl px-3.5 py-1.5 min-w-8 h-6 shadow-sm">
        <span className="flex gap-1">
          <span 
            className="w-1.5 h-1.5 bg-warm-600 rounded-full opacity-70"
            style={{ animation: 'typing-bounce 1s infinite 0s' }} 
          />
          <span 
            className="w-1.5 h-1.5 bg-warm-600 rounded-full opacity-70"
            style={{ animation: 'typing-bounce 1s infinite 0.2s' }} 
          />
          <span 
            className="w-1.5 h-1.5 bg-warm-600 rounded-full opacity-70"
            style={{ animation: 'typing-bounce 1s infinite 0.4s' }} 
          />
        </span>
      </span>
      <style>{`
        @keyframes typing-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}