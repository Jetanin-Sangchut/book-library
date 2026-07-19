'use client'

import { BookFormData } from '@/types'

type Props = {
  formData: BookFormData
  setFormData: React.Dispatch<React.SetStateAction<BookFormData>>
  onSubmit: (data: BookFormData) => Promise<void>
  loading: boolean
  titleInputRef: React.RefObject<HTMLInputElement | null>
}

export default function BookForm({ formData, setFormData, onSubmit, loading, titleInputRef }: Props) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 mb-6">
      <h2 className="text-display mb-4" style={{ fontSize: '1.375rem', lineHeight: 1.35, letterSpacing: '-0.012em', color: 'var(--ink)' }}>
        เพิ่มหนังสือใหม่
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="book-title" className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>ชื่อหนังสือ *</label>
          <input
            id="book-title"
            ref={titleInputRef}
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="input-field"
            placeholder="ชื่อหนังสือ"
          />
        </div>
        <div>
          <label htmlFor="book-author" className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>ผู้แต่ง *</label>
          <input
            id="book-author"
            type="text"
            required
            value={formData.author}
            onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
            className="input-field"
            placeholder="ชื่อผู้แต่ง"
          />
        </div>
        <div>
          <label htmlFor="book-genre" className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>หมวดหมู่</label>
          <input
            id="book-genre"
            type="text"
            value={formData.genre}
            onChange={e => setFormData(prev => ({ ...prev, genre: e.target.value }))}
            className="input-field"
            placeholder="หมวดหมู่ (ไม่บังคับ)"
          />
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn btn-primary mt-4">
        {loading && (
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
        {loading ? 'กำลังเพิ่ม...' : 'เพิ่มหนังสือ'}
      </button>
    </form>
  )
}
