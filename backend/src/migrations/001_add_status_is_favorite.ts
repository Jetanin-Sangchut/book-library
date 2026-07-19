import { Client } from '@libsql/client'

export const name = '001_add_status_is_favorite'

export async function up(db: Client): Promise<void> {
  await db.execute("ALTER TABLE books ADD COLUMN status TEXT DEFAULT 'shelved'")
  await db.execute('ALTER TABLE books ADD COLUMN is_favorite INTEGER DEFAULT 0')
}

export async function down(db: Client): Promise<void> {
  // Reverse order of up() — drop is_favorite before status
  await db.execute('ALTER TABLE books DROP COLUMN is_favorite')
  await db.execute('ALTER TABLE books DROP COLUMN status')
}
