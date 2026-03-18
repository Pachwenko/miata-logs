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
