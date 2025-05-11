export default function TypingBubble() {
    return (
      <div style={{ textAlign: 'left', margin: '12px 0' }}>
        <span style={{
          display: 'inline-block',
          background: '#282846',
          color: '#fff',
          borderRadius: 16,
          padding: '10px 18px',
          maxWidth: '80%',
          minWidth: 48,
          wordBreak: 'break-word',
          whiteSpace: 'pre-line',
          height: 24
        }}>
          <span className="typing-bubble-dots" style={{ display: 'inline-block', width: 24, textAlign: 'center' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, background: '#fff', borderRadius: '50%', margin: '0 2px', animation: 'typing-bounce 1s infinite 0s' }} />
            <span style={{ display: 'inline-block', width: 6, height: 6, background: '#fff', borderRadius: '50%', margin: '0 2px', animation: 'typing-bounce 1s infinite 0.2s' }} />
          </span>
        </span>
      </div>
    )
  }