import { eq, and, ne } from 'drizzle-orm';
import { db } from '../db/index.js';
import { themes, tasks, habits, goals } from '../db/schema.js';
import type { CreateThemeBody, PatchThemeBody } from '@shared/types';

function toThemeResponse(row: typeof themes.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    sortOrder: row.sortOrder,
    isSystem: row.isSystem,
  };
}

export async function getThemes(userId: string) {
  const rows = await db
    .select()
    .from(themes)
    .where(eq(themes.userId, userId))
    .orderBy(themes.sortOrder);
  return rows.map(toThemeResponse);
}

export async function createTheme(userId: string, body: CreateThemeBody) {
  const existing = await db
    .select({ id: themes.id })
    .from(themes)
    .where(eq(themes.userId, userId));

  const duplicate = existing.find(
    (t) => t.id, // checked below via name collision
  );
  void duplicate;

  // Case-insensitive duplicate check
  const all = await db.select().from(themes).where(eq(themes.userId, userId));
  const nameTaken = all.some((t) => t.name.toLowerCase() === body.name.toLowerCase());
  if (nameTaken) {
    const err = new Error('THEME_NAME_EXISTS');
    err.name = 'THEME_NAME_EXISTS';
    throw err;
  }

  const maxOrder = all.reduce((m, t) => Math.max(m, t.sortOrder), -1);

  const [row] = await db
    .insert(themes)
    .values({ userId, name: body.name, color: body.color, icon: body.icon, sortOrder: maxOrder + 1 })
    .returning();

  return toThemeResponse(row!);
}

export async function updateTheme(userId: string, themeId: string, body: PatchThemeBody) {
  const [theme] = await db
    .select()
    .from(themes)
    .where(and(eq(themes.id, themeId), eq(themes.userId, userId)))
    .limit(1);

  if (!theme) return null;
  if (theme.isSystem && (body.name !== undefined || body.color !== undefined)) {
    const err = new Error('CANNOT_MODIFY_SYSTEM');
    err.name = 'CANNOT_MODIFY_SYSTEM';
    throw err;
  }

  if (body.name) {
    const all = await db
      .select()
      .from(themes)
      .where(and(eq(themes.userId, userId), ne(themes.id, themeId)));
    const nameTaken = all.some((t) => t.name.toLowerCase() === body.name!.toLowerCase());
    if (nameTaken) {
      const err = new Error('THEME_NAME_EXISTS');
      err.name = 'THEME_NAME_EXISTS';
      throw err;
    }
  }

  const [row] = await db
    .update(themes)
    .set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.color !== undefined && { color: body.color }),
      ...(body.icon !== undefined && { icon: body.icon }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
    })
    .where(eq(themes.id, themeId))
    .returning();

  return toThemeResponse(row!);
}

export async function deleteTheme(userId: string, themeId: string) {
  const [theme] = await db
    .select()
    .from(themes)
    .where(and(eq(themes.id, themeId), eq(themes.userId, userId)))
    .limit(1);

  if (!theme) return null;
  if (theme.isSystem) {
    const err = new Error('CANNOT_DELETE_SYSTEM');
    err.name = 'CANNOT_DELETE_SYSTEM';
    throw err;
  }

  // Find Uncategorized theme for this user
  const [uncategorized] = await db
    .select()
    .from(themes)
    .where(and(eq(themes.userId, userId), eq(themes.isSystem, true)))
    .limit(1);

  if (!uncategorized) throw new Error('Uncategorized theme missing');

  // Move all linked items to Uncategorized
  const [movedTasks] = await db
    .update(tasks)
    .set({ themeId: uncategorized.id })
    .where(and(eq(tasks.themeId, themeId), eq(tasks.userId, userId)))
    .returning();

  const [movedHabits] = await db
    .update(habits)
    .set({ themeId: uncategorized.id })
    .where(and(eq(habits.themeId, themeId), eq(habits.userId, userId)))
    .returning();

  const [movedGoals] = await db
    .update(goals)
    .set({ themeId: uncategorized.id })
    .where(and(eq(goals.themeId, themeId), eq(goals.userId, userId)))
    .returning();

  await db.delete(themes).where(eq(themes.id, themeId));

  const movedItemCount =
    (movedTasks ? 1 : 0) + (movedHabits ? 1 : 0) + (movedGoals ? 1 : 0);

  return { movedItemCount };
}
