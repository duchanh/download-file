import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const DEFAULT_URL =
  'https://io.meeymedia.com/meeyland-test/files/2026/08/11/7-file-ppt-1786437234124-148809.ppt'

const DEFAULT_NAME = 'Tai-lieu-thu-nghiem.ppt'

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '--'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let index = 0

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }

  return `${value.toFixed(index ? 2 : 0)} ${units[index]}`
}

function triggerBlobDownload(blob, fileName) {
  const blobUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
}

function App() {
  const [url, setUrl] = useState(DEFAULT_URL)
  const [fileName, setFileName] = useState(DEFAULT_NAME)
  const [preparedFile, setPreparedFile] = useState(null)
  const [busyAction, setBusyAction] = useState('')
  const [logs, setLogs] = useState([])

  const environment = useMemo(
    () => ({
      secureContext: window.isSecureContext,
      share: typeof navigator.share === 'function',
      canShare: typeof navigator.canShare === 'function',
      userAgent: navigator.userAgent
    }),
    []
  )

  const addLog = (message, type = 'info') => {
    setLogs((current) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        message,
        type,
        time: new Date().toLocaleTimeString('vi-VN')
      },
      ...current
    ])
  }

  const fetchFile = async () => {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const blob = await response.blob()
    return new File([blob], fileName, {
      type: blob.type || 'application/octet-stream'
    })
  }

  const run = async (name, action) => {
    if (busyAction) return
    setBusyAction(name)
    addLog(`Bắt đầu: ${name}`)

    try {
      await action()
      addLog(`Hoàn tất: ${name}`, 'success')
    } catch (error) {
      addLog(
        `${name}: ${error?.name || 'Error'} — ${error?.message || String(error)}`,
        error?.name === 'AbortError' ? 'info' : 'error'
      )
    } finally {
      setBusyAction('')
    }
  }

  const openDirect = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.target = '_blank'
    link.rel = 'noreferrer'
    document.body.appendChild(link)
    link.click()
    link.remove()
    addLog('Đã mở URL trực tiếp. Tên file phụ thuộc server/trình duyệt.', 'success')
  }

  const blobDownload = () =>
    run('Blob download', async () => {
      const file = await fetchFile()
      triggerBlobDownload(file, file.name)
      addLog(`Blob: ${file.name}, ${formatBytes(file.size)}, ${file.type}`)
    })

  const fetchAndShare = () =>
    run('Fetch + Share một lần', async () => {
      const file = await fetchFile()
      const shareData = { files: [file], title: file.name }

      if (!navigator.canShare?.({ files: [file] })) {
        addLog('canShare(files) = false, chuyển sang Blob download')
        triggerBlobDownload(file, file.name)
        return
      }

      await navigator.share(shareData)
    })

  const prepareFile = () =>
    run('Chuẩn bị file', async () => {
      const file = await fetchFile()
      setPreparedFile(file)
      addLog(`Đã chuẩn bị: ${file.name}, ${formatBytes(file.size)}, ${file.type}`, 'success')
    })

  const sharePrepared = () =>
    run('Share file đã chuẩn bị', async () => {
      if (!preparedFile) throw new Error('Chưa chuẩn bị file')
      if (!navigator.canShare?.({ files: [preparedFile] })) {
        throw new Error('Trình duyệt không hỗ trợ chia sẻ loại file này')
      }

      await navigator.share({
        files: [preparedFile],
        title: preparedFile.name
      })
    })

  return (
    <main>
      <header>
        <span className="eyebrow">ReactJS mobile lab</span>
        <h1>Kiểm tra tải và lưu file</h1>
        <p>So sánh trực tiếp, Blob download và Web Share trên Safari/Chrome iOS.</p>
      </header>

      <section className="card form-card">
        <label>
          URL file
          <textarea value={url} onChange={(event) => setUrl(event.target.value.trim())} rows="4" />
        </label>
        <label>
          Tên file mong muốn
          <input value={fileName} onChange={(event) => setFileName(event.target.value)} />
        </label>
      </section>

      <section className="card">
        <h2>Các cách thử nghiệm</h2>
        <div className="actions">
          <button onClick={openDirect} disabled={!!busyAction}>
            1. Mở link trực tiếp
            <small>Không fetch, tên phụ thuộc server</small>
          </button>
          <button onClick={blobDownload} disabled={!!busyAction}>
            {busyAction === 'Blob download' ? <Spinner /> : null}
            2. Blob download
            <small>Ép tên bằng thuộc tính download</small>
          </button>
          <button onClick={fetchAndShare} disabled={!!busyAction}>
            {busyAction === 'Fetch + Share một lần' ? <Spinner /> : null}
            3. Fetch rồi Share
            <small>Giống luồng đang muốn thử</small>
          </button>
        </div>
      </section>

      <section className="card two-step">
        <h2>Web Share hai bước</h2>
        <p>Cách này giữ user gesture tốt hơn vì lần share không phải chờ fetch.</p>
        <div className="row-actions">
          <button className="secondary" onClick={prepareFile} disabled={!!busyAction}>
            {busyAction === 'Chuẩn bị file' ? <Spinner /> : null}
            Chuẩn bị file
          </button>
          <button onClick={sharePrepared} disabled={!!busyAction || !preparedFile}>
            {busyAction === 'Share file đã chuẩn bị' ? <Spinner /> : null}
            Lưu hoặc chia sẻ
          </button>
        </div>
        <div className={`prepared ${preparedFile ? 'ready' : ''}`}>
          {preparedFile
            ? `${preparedFile.name} · ${formatBytes(preparedFile.size)} · sẵn sàng`
            : 'Chưa có file trong bộ nhớ'}
        </div>
      </section>

      <section className="card diagnostics">
        <h2>Môi trường</h2>
        <dl>
          <div><dt>HTTPS / secure context</dt><dd>{String(environment.secureContext)}</dd></div>
          <div><dt>navigator.share</dt><dd>{String(environment.share)}</dd></div>
          <div><dt>navigator.canShare</dt><dd>{String(environment.canShare)}</dd></div>
        </dl>
        <code>{environment.userAgent}</code>
      </section>

      <section className="card logs">
        <div className="logs-heading">
          <h2>Nhật ký</h2>
          <button className="text-button" onClick={() => setLogs([])}>Xóa</button>
        </div>
        {logs.length ? (
          <ul>
            {logs.map((log) => (
              <li key={log.id} className={log.type}>
                <time>{log.time}</time> {log.message}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">Chưa có thao tác.</p>
        )}
      </section>
    </main>
  )
}

function Spinner() {
  return <span className="spinner" aria-hidden="true" />
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
