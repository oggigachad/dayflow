import React, { useState, useEffect, useCallback } from 'react'
import { useHRMS } from '../../context/HRMSContext.jsx'
import api from '../../services/api.js'

export default function ProfileDocuments({ employee, isHr = false }) {
  const { showToast, currentUser } = useHRMS()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  const targetUserId = employee?.id || currentUser?.id

  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true)
      let docs = []
      if (isHr && targetUserId) {
        docs = await api.documents.getUserDocs(targetUserId)
      } else {
        docs = await api.documents.getMyDocs()
      }
      setDocuments(docs || [])
    } catch {
      // Fallback state if no docs in DB yet
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }, [isHr, targetUserId])

  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  const handleDownload = (doc) => {
    // Generate text/binary blob download simulation
    const blob = new Blob(
      [`Official Record: ${doc.document_type || doc.type}\nFile: ${doc.file_name || doc.name}\nEmployee ID: ${targetUserId}\nTimestamp: ${doc.created_at || new Date().toISOString()}`],
      { type: 'text/plain;charset=utf-8' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.file_name || doc.name || `${doc.document_type}.txt`
    a.click()
    URL.revokeObjectURL(url)
    showToast(`Downloaded "${doc.file_name || doc.name}"`)
  }

  const handleFileUpload = async (docType, e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      const uploaded = await api.documents.uploadDoc({
        document_type: docType,
        file_name: file.name,
        file_size: sizeStr,
        user_id: isHr && targetUserId ? targetUserId : null,
      })

      setDocuments((prev) => {
        const filtered = prev.filter((d) => (d.document_type || d.type) !== docType)
        return [uploaded, ...filtered]
      })

      showToast(`Uploaded ${docType}: ${file.name}`)
    } catch (err) {
      showToast(`Upload failed: ${err.message}`)
    }
  }

  const getDocIcon = (type) => {
    switch (type) {
      case 'Resume':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        )
      case 'Offer Letter':
      case 'Employment Contract':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        )
      case 'ID Documents':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="9" cy="10" r="2" />
            <line x1="15" y1="8" x2="17" y2="8" />
            <line x1="15" y1="12" x2="17" y2="12" />
            <line x1="7" y1="16" x2="17" y2="16" />
          </svg>
        )
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        )
    }
  }

  const docCategories = ['Resume', 'Offer Letter', 'Employment Contract', 'ID Documents', 'Bank Details']

  return (
    <div className="hrms-card" style={{ gap: 20 }}>
      <div className="hrms-card-header" style={{ paddingBottom: 16, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="hrms-card-title-group">
          <h3 className="hrms-card-title" style={{ fontSize: 19 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            Personnel Documents & Compliance
          </h3>
          <p className="hrms-card-subtitle">Verified contracts, identity records, and onboarding paperwork</p>
        </div>

        <span className="hrms-pill approved" style={{ fontSize: 12 }}>
          {documents.length} Files on Record
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {docCategories.map((category) => {
          const doc = documents.find((d) => (d.document_type || d.type) === category)
          
          // Bank details: uploaded by employee user only for security & privacy
          // Offer Letter / Employment Contract: uploaded by HR Admin
          // Resume / ID Documents: uploaded by employee or HR
          let canUpload = false
          let uploadHint = ''
          if (category === 'Bank Details') {
            canUpload = !isHr || currentUser?.id === targetUserId
            uploadHint = 'Employee self-upload only'
          } else if (category === 'Offer Letter' || category === 'Employment Contract') {
            canUpload = isHr
            uploadHint = 'Admin issued'
          } else {
            canUpload = isHr || (!isHr && currentUser?.id === targetUserId)
            uploadHint = 'Employee onboarding'
          }

          return (
            <div
              key={category}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'rgb(254, 241, 238)',
                borderRadius: 16,
                border: '1px solid rgba(122,50,227,0.08)',
                flexWrap: 'wrap',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: '#ffffff',
                    border: '1.5px solid rgba(122,50,227,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgb(122,50,227)',
                  }}
                >
                  {getDocIcon(category)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ color: '#000', fontSize: 15 }}>{category}</strong>
                    {doc ? (
                      <span className="hrms-pill approved" style={{ fontSize: 11, padding: '2px 8px' }}>
                        Uploaded
                      </span>
                    ) : (
                      <span className="hrms-pill pending" style={{ fontSize: 11, padding: '2px 8px' }}>
                        Missing
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)' }}>
                    {doc
                      ? `${doc.file_name || doc.name} · ${doc.file_size || doc.size || '1.2 MB'} · Stored in Database`
                      : 'No document file uploaded yet'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {doc && (
                  <button
                    type="button"
                    className="cta-secondary"
                    style={{ height: 36, padding: '0 14px', fontSize: 13, borderRadius: 10, background: '#fff' }}
                    onClick={() => handleDownload(doc)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>View / Download</span>
                  </button>
                )}

                {canUpload && (
                  <label
                    className="cta-primary"
                    style={{
                      height: 36,
                      padding: '0 14px',
                      fontSize: 13,
                      borderRadius: 10,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>{doc ? 'Replace' : 'Upload'}</span>
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx,.png,.jpg"
                      onChange={(e) => handleFileUpload(category, e)}
                    />
                  </label>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
