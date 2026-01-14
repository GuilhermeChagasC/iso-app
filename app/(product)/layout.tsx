import React from 'react'

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={styles.page}>
      <Header />
      <main style={styles.main}>{children}</main>
    </div>
  )
}

function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.headerInner}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>◆</span>
          <span>ISO AI Report</span>
        </div>
      </div>
    </header>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#FFFFFF',
  },
  header: {
    borderBottom: '1px solid #E5E7EB',
    background: '#FFFFFF',
  },
  headerInner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 700,
    color: '#6D28D9',
    fontSize: 18,
  },
  logoIcon: {
    fontSize: 20,
  },
  main: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '48px 24px',
  },
}
