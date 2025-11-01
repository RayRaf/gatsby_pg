import { NextRequest, NextResponse } from 'next/server'
import { registrations } from '@/lib/db/registrations'

// GET registration by cookie_id
export async function GET(
  request: NextRequest,
  { params }: { params: { cookieId: string } }
) {
  try {
    const registration = await registrations.getByCookieId(params.cookieId)
    
    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Error fetching registration:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registration' },
      { status: 500 }
    )
  }
}

// PUT update registration
export async function PUT(
  request: NextRequest,
  { params }: { params: { cookieId: string } }
) {
  try {
    const body = await request.json()
    const { name, drinks, individual_wishes } = body

    const registration = await registrations.update(params.cookieId, {
      name,
      drinks,
      individual_wishes,
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Error updating registration:', error)
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    )
  }
}

// DELETE registration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { cookieId: string } }
) {
  try {
    const success = await registrations.delete(params.cookieId)

    if (!success) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting registration:', error)
    return NextResponse.json(
      { error: 'Failed to delete registration' },
      { status: 500 }
    )
  }
}
