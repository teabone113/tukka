"use client";
import { useEffect, useState } from 'react';
import { getTheme, type ThemeMode } from '@tukka/theme';
import Link from 'next/link';

export default function SettingsPage() {
  const [mode, setMode] = useState<ThemeMode>('light');
  useEffect(() => {
    const m = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') as ThemeMode;
    setMode(m);
  }, []);
  useEffect(() => {
    const vars = getTheme(mode);
    Object.entries(vars).forEach(([k, v]) => document.body.style.setProperty(k, v));
  }, [mode]);
  return (
    <main style={{ padding: 24, display: 'grid', gap: 12 }}>
      <h2>Settings</h2>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>Theme</span>
        <select value={mode} onChange={(e) => setMode(e.target.value as ThemeMode)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <Link href="/">Back</Link>
    </main>
  );
}


