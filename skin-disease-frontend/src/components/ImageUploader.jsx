import { useState } from 'react'
import { Upload, Button, Image } from 'antd'
import { UploadOutlined, SendOutlined } from '@ant-design/icons'

export default function ImageUploader({ onSubmit, loading }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)

  const handleBeforeUpload = (f) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    return false // prevent auto upload
  }

  const handleSubmit = () => {
    if (!file) return
    onSubmit(file)
    setFile(null)
    setPreview(null)
  }

  return (
    <div style={{
      padding: '12px 16px',
      borderTop: '1px solid var(--color-border)',
      background: 'var(--color-sidebar)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <Upload beforeUpload={handleBeforeUpload} showUploadList={false} accept=".jpg,.jpeg,.png">
        <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
      </Upload>

      {preview && (
        <Image src={preview} width={48} height={48}
          style={{ borderRadius: 8, objectFit: 'cover' }} preview={false} />
      )}

      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleSubmit}
        disabled={!file || loading}
        loading={loading}
      >
        Phân tích
      </Button>
    </div>
  )
}