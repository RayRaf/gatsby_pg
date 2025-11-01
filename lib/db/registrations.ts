import { query, queryOne, queryAll } from './postgres'

export interface Registration {
  id: string
  name: string
  drinks: string[]
  individual_wishes: string | null
  cookie_id: string
  created_at: Date
  updated_at: Date
}

export const registrations = {
  // Get all registrations
  async getAll(): Promise<Registration[]> {
    return queryAll(
      'SELECT * FROM public.registrations ORDER BY created_at ASC'
    )
  },

  // Get registration by cookie_id
  async getByCookieId(cookieId: string): Promise<Registration | null> {
    return queryOne(
      'SELECT * FROM public.registrations WHERE cookie_id = $1',
      [cookieId]
    )
  },

  // Create new registration
  async create(data: {
    name: string
    drinks: string[]
    individual_wishes?: string
    cookie_id: string
  }): Promise<Registration> {
    const result = await queryOne(
      `INSERT INTO public.registrations (name, drinks, individual_wishes, cookie_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.name, data.drinks, data.individual_wishes || null, data.cookie_id]
    )
    return result
  },

  // Update registration by cookie_id
  async update(
    cookieId: string,
    data: {
      name?: string
      drinks: string[]
      individual_wishes?: string
    }
  ): Promise<Registration | null> {
    const result = await queryOne(
      `UPDATE public.registrations 
       SET name = $1, drinks = $2, individual_wishes = $3, updated_at = CURRENT_TIMESTAMP
       WHERE cookie_id = $4
       RETURNING *`,
      [data.name, data.drinks, data.individual_wishes || null, cookieId]
    )
    return result
  },

  // Delete registration by cookie_id
  async delete(cookieId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM public.registrations WHERE cookie_id = $1',
      [cookieId]
    )
    return (result.rowCount || 0) > 0
  },
}
