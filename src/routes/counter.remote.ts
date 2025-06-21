import { command, query } from '$app/server'
import Database from 'better-sqlite3'

// Initialize SQLite database
const dbPath = './db/db.sqlite'
const db = new Database(dbPath)

// Create counter table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS counter (
    id INTEGER PRIMARY KEY,
    value INTEGER NOT NULL DEFAULT 0
  )
`)

// Initialize counter if it doesn't exist
const initCounter = db.prepare('INSERT OR IGNORE INTO counter (id, value) VALUES (1, 0)')
initCounter.run()

// Prepared statements for better performance
const getCounterStmt = db.prepare('SELECT value FROM counter WHERE id = 1')
const incrementCounterStmt = db.prepare('UPDATE counter SET value = value + 1 WHERE id = 1')
const resetCounterStmt = db.prepare('UPDATE counter SET value = 0 WHERE id = 1')

export const getCounter = query(async () => {
  const result = getCounterStmt.get() as { value: number }
  return result.value
})

export const incrementCounter = command(async () => {
  incrementCounterStmt.run()
  
  // Refresh the counter query for single-flight mutation
  await getCounter().refresh()
  
  return { success: true }
})

export const resetCounter = command(async () => {
  resetCounterStmt.run()
  
  // Refresh the counter query for single-flight mutation
  await getCounter().refresh()
  
  return { success: true }
})