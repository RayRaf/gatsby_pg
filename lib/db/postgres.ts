import { Pool } from 'pg'

let pool: Pool | null = null

export function getPool() {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL
    
    // Debug logging
    console.log('DATABASE_URL exists:', !!databaseUrl)
    console.log('DATABASE_URL length:', databaseUrl?.length || 0)
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables')
    }
    
    pool = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }
  return pool
}

// Helper function to query the database
export async function query(text: string, params?: any[]) {
  const pool = getPool()
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Helper function to get a single row
export async function queryOne(text: string, params?: any[]) {
  const result = await query(text, params)
  return result.rows[0] || null
}

// Helper function to get all rows
export async function queryAll(text: string, params?: any[]) {
  const result = await query(text, params)
  return result.rows
}
