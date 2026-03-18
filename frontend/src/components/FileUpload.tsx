import { useRef } from 'react'
import './FileUpload.css'

interface FileUploadProps {
  onFileSelect: (content: string) => void
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file) {
      readFile(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      readFile(file)
    }
  }

  const readFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      onFileSelect(content)
    }
    reader.readAsText(file)
  }

  const loadExampleFile = async () => {
    try {
      const response = await fetch('/miata-logs/example_idel_log.vtlog')
      const content = await response.text()
      onFileSelect(content)
    } catch (error) {
      console.error('Failed to load example file:', error)
    }
  }

  return (
    <div className="file-upload-container">
      <div
        className="upload-area"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className="upload-content">
          <h2>📊 Miata Log Viewer</h2>
          <p>Drag and drop a .vtlog file here</p>
          <p className="or-text">or click to browse</p>
        </div>
      </div>

      <div className="example-section">
        <p className="example-label">🧪 Try it out:</p>
        <button className="example-button" onClick={loadExampleFile}>
          Load Example File
        </button>
        <a href="/miata-logs/example_idel_log.vtlog" download className="download-link">
          ⬇️ Download Example
        </a>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".vtlog,.xml"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
    </div>
  )
}
