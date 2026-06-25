export default function MessageBubble({ role, content }) {
  const isUser = role === 'user'

  if (content.startsWith('__IMAGE__:')) {
    const b64 = content.replace('__IMAGE__:', '')
    return (
      <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
        <img
          src={`data:image/jpeg;base64,${b64}`}
          alt="uploaded"
          style={{ maxWidth: 200, borderRadius: 12, border: '1px solid var(--color-border)' }}
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
      <div style={{
        maxWidth: '70%',
        padding: '10px 14px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser ? 'var(--color-bubble-user)' : 'var(--color-bubble-ai)',
        border: '1px solid var(--color-border)',
        fontSize: 14,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
      }}>
        {content}
      </div>
    </div>
  )
}