import { db } from './index.js';
import { themes } from './schema.js';

const DEFAULT_THEMES = [
  { name: 'Health',         color: '#8C967A', icon: 'heart',     isSystem: false },
  { name: 'Career',         color: '#BF5B45', icon: 'briefcase', isSystem: false },
  { name: 'Personal',       color: '#E9C176', icon: 'user',      isSystem: false },
  { name: 'Learning',       color: '#7B9CB5', icon: 'book',      isSystem: false },
  { name: 'Uncategorized',  color: '#6B6B6B', icon: 'circle',    isSystem: true  },
] as const;

export async function seedDefaultThemes(userId: string) {
  const rows = DEFAULT_THEMES.map((t, i) => ({
    userId,
    name: t.name,
    color: t.color,
    icon: t.icon,
    isSystem: t.isSystem,
    sortOrder: i,
  }));

  await db.insert(themes).values(rows).onConflictDoNothing();
}
