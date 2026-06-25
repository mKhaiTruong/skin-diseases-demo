import { useEffect, useState } from 'react'
import { Button, List, Popconfirm, Typography, Tooltip } from 'antd'
import { PlusOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons'
import { getThreads, createThread, deleteThread } from '../api/client'

const { Text } = Typography

export default function Sidebar({ threadId, onSelect, onDelete, refresh, collapsed }) {
  const [threads, setThreads] = useState([])

  const fetchThreads = async () => {
    const res = await getThreads()
    setThreads(res.data)
    if (!threadId && res.data.length > 0) {
      onSelect(res.data[0].id)
    }
  }

  useEffect(() => { fetchThreads() }, [refresh])

  const handleCreate = async () => {
    const res = await createThread()
    await fetchThreads()
    onSelect(res.data.id)
  }

  const handleDelete = async (tid) => {
    await deleteThread(tid)
    await fetchThreads()
    onDelete()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', padding: '8px 12px' }}>

      {/* New chat button */}
      <div
        style={{
            display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
                padding: '6px 4px',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'background 0.15s',
            }}
            onClick={handleCreate}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bubble-user)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            <Button
                type="primary"
                icon={<PlusOutlined />}
                shape="circle"
                size="small"
                onClick={(e) => { e.stopPropagation(); handleCreate() }}
            />
            {!collapsed && (
                <Text style={{ fontSize: 14, color: 'var(--color-text)', userSelect: 'none' }}>
                New chat
                </Text>
            )}
        </div>

      {/* Thread list — ẩn khi collapsed */}
      {!collapsed && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {threads.length === 0
            ? <Text style={{ fontSize: 12, color: 'var(--color-text-muted)', paddingLeft: 4 }}>Chưa có cuộc chat nào</Text>
            : (
              <List
                dataSource={threads}
                renderItem={(thread) => (
                  <List.Item
                    style={{
                      padding: '7px 10px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      marginBottom: 2,
                      background: thread.id === threadId ? 'var(--color-bubble-user)' : 'transparent',
                      border: 'none',
                      transition: 'background 0.15s',
                    }}
                    onClick={() => onSelect(thread.id)}
                    actions={[
                      <Popconfirm
                        title="Xóa cuộc chat này?"
                        onConfirm={(e) => { e.stopPropagation(); handleDelete(thread.id) }}
                        okText="Xóa"
                        cancelText="Hủy"
                      >
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          danger
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<MessageOutlined style={{ color: 'var(--color-primary)', fontSize: 13 }} />}
                      title={
                        <Text ellipsis style={{ fontSize: 13, color: 'var(--color-text)' }}>
                          {thread.title}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            )
          }
        </div>
      )}
    </div>
  )
}