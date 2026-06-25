import axios from 'axios'

const api = axios.create({ 
    baseURL: import.meta.env.VITE_API_URL || ''
})

export const getThreads = () => api.get('/threads')
export const createThread = () => api.post('/threads')
export const deleteThread = (id) => api.delete(`/threads/${id}`)
export const getMessages = (threadId) => api.get(`/threads/${threadId}/messages`)

export const predict = (threadId, formData) =>
  api.post(`/threads/${threadId}/predict`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const predictStream = (threadId, file, onChunk, onDone) => {
  const formData = new FormData()
  formData.append('file', file)

  return fetch(`http://localhost:8000/threads/${threadId}/predict/stream`, {
    method: 'POST',
    body: formData,
  }).then(async (res) => {
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() // giữ lại dòng chưa hoàn chỉnh

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const data = JSON.parse(line.replace('data: ', ''))
          console.log('chunk received:', data)
          if (data.done) onDone(data)
          else onChunk(data.text)
        } catch {
          console.log('parse error on line:', line)
        }
      }
    }
  })
}

export const updateThreadTitle = (id, title) => api.patch(`/threads/${id}/title`, { title })

export const sendChat = (threadId, message) =>
  api.post(`/threads/${threadId}/chat`, { message })