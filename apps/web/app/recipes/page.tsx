import Link from 'next/link';

export default function RecipesPage() {
  return (
    <main style={{ padding: 24 }}>
      <h2>Recipes</h2>
      <p>Recipe list goes here.</p>
      <Link href="/">Back</Link>
    </main>
  );
}


