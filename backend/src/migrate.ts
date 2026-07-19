import { db } from './db'
import * as m001 from './migrations/001_add_status_is_favorite'

type Migration = {
  name: string
  up: (db: any) => Promise<void>
  down: (db: any) => Promise<void>
}

const migrations: Migration[] = [m001]

export async function runMigrations(): Promise<void> {
  // Ensure tracking table exists
  await db.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `)

  for (const migration of migrations) {
    const existing = await db.execute({
      sql: 'SELECT name FROM _migrations WHERE name = ?',
      args: [migration.name],
    })

    if (existing.rows.length > 0) {
      console.log(`[migrate] already applied: ${migration.name}`)
      continue
    }

    console.log(`[migrate] applying: ${migration.name}`)
    try {
      await migration.up(db as any)
      await db.execute({
        sql: 'INSERT INTO _migrations (name) VALUES (?)',
        args: [migration.name],
      })
      console.log(`[migrate] done: ${migration.name}`)
    } catch (err) {
      console.error(`[migrate] failed: ${migration.name}`, err)
      throw err
    }
  }
}

export async function rollbackLast(): Promise<void> {
  const result = await db.execute(
    'SELECT name FROM _migrations ORDER BY applied_at DESC LIMIT 1'
  )

  if (result.rows.length === 0) {
    console.log('[migrate] nothing to rollback')
    return
  }

  const lastName = result.rows[0].name as string
  const migration = migrations.find(m => m.name === lastName)

  if (!migration) {
    throw new Error(`[migrate] no migration found for: ${lastName}`)
  }

  console.log(`[migrate] rolling back: ${migration.name}`)
  try {
    await migration.down(db as any)
    await db.execute({ sql: 'DELETE FROM _migrations WHERE name = ?', args: [migration.name] })
    console.log(`[migrate] rolled back: ${migration.name}`)
  } catch (err) {
    console.error(`[migrate] rollback failed: ${migration.name}`, err)
    throw err
  }
}
