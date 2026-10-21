import { NextResponse } from 'next/server'

/**
 * Demo provisioning is permanently disabled for production launch.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Demo provisioning is disabled.' },
    { status: 404 }
  )
}

export async function GET() {
  return NextResponse.json(
    { error: 'Not found.' },
    { status: 404 }
  )
}

