import Link from 'next/link';

export default function AppHome() {
  return (
    <main style={{ padding: 24, display: 'grid', gap: 16 }}>
      <h1 style={{ color: 'var(--color-primary)' }}>tukka</h1>
      <nav style={{ display: 'grid', gap: 8 }}>
        <Link href="/recipes">Recipes</Link>
        <Link href="/planner">Meal Planner</Link>
        <Link href="/lists">Shopping Lists</Link>
        <Link href="/settings">Settings</Link>
      </nav>
    </main>
  );
}


