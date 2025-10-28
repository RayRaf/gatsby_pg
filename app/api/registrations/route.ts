import { NextRequest, NextResponse } from 'next/server'
import { registrations } from '@/lib/db/registrations'

// GET all registrations
export async function GET() {
  try {
    const data = await registrations.getAll()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}

// POST new registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, drinks, individual_wishes, cookie_id } = body

    if (!name || !cookie_id) {
      return NextResponse.json(
        { error: 'Name and cookie_id are required' },
        { status: 400 }
      )
    }

    const registration = await registrations.create({
      name,
      drinks: drinks || [],
      individual_wishes,
      cookie_id,
    })

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    console.error('Error creating registration:', error)
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    )
  }
}
