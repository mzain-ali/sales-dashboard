'use client'
import { useState } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'

export default function AnnotateModal() {
  const { activeMonth, modalPayload, annotations, setAnnotation, deleteAnnotation, closeModal } = useDashboardStore()
  const day = modalPayload || ''
  const key = activeMonth && day ? `${activeMonth}-${day}` : ''
  const currentNote = key ? annotations[key] || '' : ''
  const [note, setNote] = useState(currentNote)

  const handleSave = () => {
    if (!key) return
    if (note.trim() === '') {
      deleteAnnotation(key)
    } else {
      setAnnotation(key, note.trim())
    }
    closeModal()
  }

  const handleDelete = () => {
    if (!key) return
    deleteAnnotation(key)
    closeModal()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
        Add a note or comment for day <strong>{day}</strong> of <strong>{activeMonth}</strong>.
      </div>
      <textarea
        style={{
          width: '100%',
          minHeight: 120,
          padding: 12,
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          fontSize: 14,
          fontFamily: 'inherit',
          resize: 'vertical',
          outline: 'none',
        }}
        placeholder="Type your notes here..."
        value={note}
        onChange={e => setNote(e.target.value)}
        autoFocus
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        {currentNote && (
          <button
            onClick={handleDelete}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--red)',
              background: 'transparent',
              color: 'var(--red)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Delete
          </button>
        )}
        <button
          onClick={closeModal}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Save
        </button>
      </div>
    </div>
  )
}
