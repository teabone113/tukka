import localforage from 'localforage';
import type { Recipe, StorageRepository, UUID } from './index';

const RECIPES_KEY = 'recipes';

function sortByUpdatedAt(recipes: Recipe[]): Recipe[] {
  return [...recipes].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export class WebStorageRepository implements StorageRepository {
  async getAllRecipes(): Promise<Recipe[]> {
    const data = (await localforage.getItem<Recipe[]>(RECIPES_KEY)) ?? [];
    return sortByUpdatedAt(data);
  }

  async upsertRecipe(recipe: Recipe): Promise<void> {
    const data = (await localforage.getItem<Recipe[]>(RECIPES_KEY)) ?? [];
    const idx = data.findIndex(r => r.id === recipe.id);
    if (idx >= 0) {
      data[idx] = recipe;
    } else {
      data.push(recipe);
    }
    await localforage.setItem(RECIPES_KEY, sortByUpdatedAt(data));
  }

  async deleteRecipe(id: UUID): Promise<void> {
    const data = (await localforage.getItem<Recipe[]>(RECIPES_KEY)) ?? [];
    const next = data.filter(r => r.id !== id);
    await localforage.setItem(RECIPES_KEY, sortByUpdatedAt(next));
  }
}


