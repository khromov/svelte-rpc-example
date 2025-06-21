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

const initCounter = db.prepare('INSERT OR IGNORE INTO counter (id, value) VALUES (1, 0)')
initCounter.run()

const getCounterStmt = db.prepare('SELECT value FROM counter WHERE id = 1')
const incrementCounterStmt = db.prepare('UPDATE counter SET value = value + 1 WHERE id = 1')
const resetCounterStmt = db.prepare('UPDATE counter SET value = 0 WHERE id = 1')
const setCounterStmt = db.prepare('UPDATE counter SET value = ? WHERE id = 1')

export function getCounterValue(): number {
	const result = getCounterStmt.get() as { value: number }
	return result.value
}

export function incrementCounterValue(): void {
	incrementCounterStmt.run()
}

export function resetCounterValue(): void {
	resetCounterStmt.run()
}

export function setCounterValue(value: number): void {
	setCounterStmt.run(value)
}
