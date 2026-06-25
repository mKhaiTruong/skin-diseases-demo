import { useState } from 'react'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Tooltip, Typography, Layout, theme } from 'antd'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import './index.css'

const { Sider, Content } = Layout;
const { Text } = Typography

export default function App() {
  const [threadId, setThreadId]   = useState(null)
  const [refresh, setRefresh]     = useState(0)
  const [collapsed, setCollapsed] = useState(false);
  const [backendReady, setBackendReady] = useState(false)

  useEffect(() => {
    const checkBackend = async () => {
      while (true) {
        try {
          const res = await fetch('/health')
          if (res.ok) { setBackendReady(true); break }
        } catch {}
        await new Promise(r => setTimeout(r, 2000))
      }
    }
    checkBackend()
  }, [])

  if (!backendReady) return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      background: 'var(--color-bg)'
    }}>
      <span style={{ fontSize: 48 }}>🩺</span>
      <Spin size="large" />
      <Text style={{ color: 'var(--color-text-muted)' }}>
        Đang khởi động hệ thống, vui lòng chờ...
      </Text>
    </div>
  )

  const handleThreadChange  = (tid) => setThreadId(tid)
  const handleThreadDeleted = () => {
    setThreadId(null)
    setRefresh(r => r + 1)
  }

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ height: '100vh', background: 'var(--color-bg)' }}>
      {/* Sider ------------------------------------------------------- */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={300}
        style={{
          background: 'var(--color-sidebar)',
          borderRight: '2px solid var(--color-border)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px'
          }}
        >
          <span style={{ fontSize: 20 }}>
            🩺
          </span>

          <span
            style={{
              fontSize: 22,
              overflow: 'hidden',
              width: collapsed ? 0 : 200,
              opacity: collapsed ? 0 : 1,
              transition: 'all .2s',
              marginLeft: 8,
              whiteSpace: 'nowrap'
            }}
          >
            Skin Disease AI
          </span>
          
          <Tooltip
            title={collapsed ? 'Open sidebar' : 'Close sidebar'}
            placement="bottom"
            mouseEnterDelay={0.5}
          >
            <Button
              type="text"
              size="large"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(prev => !prev)}
              style={{ marginLeft: 'auto' }}
            />
          </Tooltip>
        </div>

        <Sidebar
          threadId={threadId}
          onSelect={handleThreadChange}
          onDelete={handleThreadDeleted}
          refresh={refresh}
          collapsed={collapsed}
        />
      </Sider>
      {/* --------------------------------------------------------------------- */}


      {/* Main Content ------------------------------------------------------- */}
      <Layout>
        <Content style={{ display: 'flex', flexDirection: 'column' }}>
          {threadId
            ? <ChatWindow threadId={threadId} onTitleUpdate={() => setRefresh(r => r + 1)} />
            : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                <p>Chọn hoặc tạo cuộc chat mới để bắt đầu 🩺</p>
              </div>
            )
          }
        </Content>
      </Layout>
      {/* ---------------------------------------------------------- */}
    </Layout>
  )
}