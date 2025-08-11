import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 style={{ color: 'var(--color-primary)', textTransform: 'lowercase', letterSpacing: '-0.02em' }}>tukka</h1>
        <p>Web PWA scaffold is live.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius)',
            padding: '12px 16px'
          }}>Primary</button>
          <button style={{
            background: 'var(--color-accent-1)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius)',
            padding: '12px 16px'
          }}>Accent</button>
        </div>
      </main>
      <footer className={styles.footer}>
        <small>© Tukka</small>
      </footer>
    </div>
  );
}
