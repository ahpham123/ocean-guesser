// src/lib/maps.ts
export function getSatelliteImageUrl(lat: number, lng: number, zoom = 6): string {
  return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},${zoom}/800x600?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
}