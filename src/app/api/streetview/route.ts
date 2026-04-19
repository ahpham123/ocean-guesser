// src/app/api/streetview/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const heading = searchParams.get('heading') ?? '0'

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat/lng' }, { status: 400 })
  }

  // Check coverage exists before returning anything
  const metaRes = await fetch(
    `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  )
  const meta = await metaRes.json()

  if (meta.status !== 'OK') {
    return NextResponse.json({ error: 'No Street View coverage' }, { status: 404 })
  }

  const imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${lat},${lng}&heading=${heading}&pitch=0&key=${process.env.GOOGLE_MAPS_API_KEY}`

  return NextResponse.json({ imageUrl })
}