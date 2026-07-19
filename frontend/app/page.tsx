import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto px-6 py-24">
        <p className="text-sm font-medium mb-6" style={{ color: 'var(--tertiary)' }}>
          ระบบจัดการคลังหนังสือส่วนตัว
        </p>
        <h1
          className="mb-6"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '4rem',
            lineHeight: 1.08,
            fontWeight: 500,
            letterSpacing: '-0.03em',
            textWrap: 'balance',
          } as React.CSSProperties}
        >
          Book Library
        </h1>
        <p className="leading-relaxed mb-10 max-w-prose" style={{ color: 'var(--muted)', fontSize: '1.0625rem', lineHeight: 1.7 }}>
          บันทึก จัดการ และค้นหาหนังสือของคุณ ในที่เดียว
        </p>
        <div>
          <Link href="/login" className="btn btn-primary inline-flex">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
      <footer className="px-6 py-6 text-xs text-center" style={{ color: 'var(--tertiary)', borderTop: '1px solid var(--border-divider)' }}>
        Book Library — Personal book management system
      </footer>
    </main>
  )
}
