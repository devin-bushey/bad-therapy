export default function TypingBubble() {
  return (
    <div className="flex justify-start my-2">
      <span 
        className="flex items-center rounded-2xl px-3.5 py-1.5 min-w-8 h-6 shadow-sm"
        style={{ backgroundColor: 'rgb(40, 40, 70)' }}
      >
        <span className="flex gap-1">
          <span 
            className="w-1.5 h-1.5 rounded-full opacity-70"
            style={{ 
              backgroundColor: '#b3b3c6',
              animation: 'typing-bounce 1s infinite 0s' 
            }} 
          />
          <span 
            className="w-1.5 h-1.5 rounded-full opacity-70"
            style={{ 
              backgroundColor: '#b3b3c6',
              animation: 'typing-bounce 1s infinite 0.2s' 
            }} 
          />
          <span 
            className="w-1.5 h-1.5 rounded-full opacity-70"
            style={{ 
              backgroundColor: '#b3b3c6',
              animation: 'typing-bounce 1s infinite 0.4s' 
            }} 
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