import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Typography, Input, Button } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { getMessages, predictStream, sendChat } from '../api/client'
import MessageBubble from './MessageBubble'
import ImageUploader from './ImageUploader'

const { Text } = Typography

export default function ChatWindow({ threadId, onTitleUpdate }) {
  const [messages, setMessages]   = useState([])
  const [streaming, setStreaming] = useState('')
  const [loading, setLoading]     = useState(false)
  const [chatInput, setChatInput] = useState('')
  const accumulatedRef            = useRef('')
  const bottomRef                 = useRef(null)

  useEffect(() => {
    getMessages(threadId).then(res => setMessages(res.data))
  }, [threadId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const handleSubmit = async (file) => {
    setLoading(true)
    setStreaming('')
    accumulatedRef.current = ''

    const b64 = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.readAsDataURL(file)
    })

    setMessages(prev => [...prev, { role: 'user', content: `__IMAGE__:${b64}` }])

    await predictStream(
      threadId,
      file,
      (text) => {
        accumulatedRef.current += text + '\n'
        flushSync(() => setStreaming(accumulatedRef.current))
      },
      () => {
        setMessages(prev => [...prev, { role: 'assistant', content: accumulatedRef.current }])
        setStreaming('')
        onTitleUpdate?.()
        setLoading(false)
      }
    )
  }

  const handleChat = async () => {
    if (!chatInput.trim()) return
    const text = chatInput.trim()
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)
    try {
      const res = await sendChat(threadId, text)
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-sidebar)',
      }}>
        <Text strong style={{ color: 'var(--color-text)' }}>🩺 Chẩn đoán da liễu</Text>
        <br />
        <Text style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          ⚠️ Công cụ hỗ trợ tham khảo, không thay thế bác sĩ chuyên khoa
        </Text>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {messages.length === 0 && !streaming && (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: 60 }}>
            <p style={{ fontSize: 32 }}>🩺</p>
            <p>Tải ảnh vùng da để bắt đầu phân tích</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}

        {streaming && <MessageBubble role="assistant" content={streaming + '▌'} />}

        {loading && !streaming && (
          <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 12 }}>
            🩺 Đang phân tích...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Image uploader */}
      <ImageUploader onSubmit={handleSubmit} loading={loading} />

      {/* Text chat */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-sidebar)',
        display: 'flex',
        gap: 8,
      }}>
        <Input
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          onPressEnter={handleChat}
          placeholder="Hỏi thêm về kết quả chẩn đoán..."
          disabled={loading}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleChat}
          disabled={!chatInput.trim() || loading}
        />
      </div>

    </div>
  )
}