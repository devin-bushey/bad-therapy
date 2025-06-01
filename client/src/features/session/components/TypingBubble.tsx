export default function TypingBubble() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '8px 0 8px 0' }}>
      <span style={{
        display: 'flex',
        alignItems: 'center',
        background: '#35355a',
        borderRadius: 16,
        padding: '6px 14px',
        minWidth: 32,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        height: 25
      }}>
        <span className="typing-bubble-dots" style={{ display: 'flex', gap: 4 }}>
          <span style={{ width: 6, height: 6, background: '#b3b3c6', borderRadius: '50%', opacity: 0.7, animation: 'typing-bounce 1s infinite 0s' }} />
          <span style={{ width: 6, height: 6, background: '#b3b3c6', borderRadius: '50%', opacity: 0.7, animation: 'typing-bounce 1s infinite 0.2s' }} />
          <span style={{ width: 6, height: 6, background: '#b3b3c6', borderRadius: '50%', opacity: 0.7, animation: 'typing-bounce 1s infinite 0.4s' }} />
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