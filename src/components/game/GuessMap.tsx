// src/components/game/GuessMap.tsx
'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

type Props = {
  onGuess: (lat: number, lng: number) => void
  disabled?: boolean
  correctLocation?: { lat: number; lng: number } | null
  guessLocation?: { lat: number; lng: number } | null
}

export default function GuessMap({ onGuess, disabled = false, correctLocation, guessLocation }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const guessMarker = useRef<mapboxgl.Marker | null>(null)
  const correctMarker = useRef<mapboxgl.Marker | null>(null)
  const line = useRef<boolean>(false)

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [0, 20],
      zoom: 1.5,
    })

    map.current.on('click', (e) => {
      if (disabled) return
      const { lng, lat } = e.lngLat

      if (guessMarker.current) {
        guessMarker.current.setLngLat([lng, lat])
      } else {
        guessMarker.current = new mapboxgl.Marker({ color: '#14b8a6' })
          .setLngLat([lng, lat])
          .addTo(map.current!)
      }

      onGuess(lat, lng)
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Show correct location and draw line after submission
  useEffect(() => {
    if (!map.current || !correctLocation || !guessLocation) return

    const mapInstance = map.current

    // Drop correct location marker
    if (correctMarker.current) correctMarker.current.remove()
    correctMarker.current = new mapboxgl.Marker({ color: '#f43f5e' })
      .setLngLat([correctLocation.lng, correctLocation.lat])
      .addTo(mapInstance)

    // Draw line between guess and correct
    const drawLine = () => {
      if (line.current) {
        if (mapInstance.getLayer('guess-line')) mapInstance.removeLayer('guess-line')
        if (mapInstance.getSource('guess-line')) mapInstance.removeSource('guess-line')
      }

      mapInstance.addSource('guess-line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [guessLocation.lng, guessLocation.lat],
              [correctLocation.lng, correctLocation.lat],
            ],
          },
        },
      })

      mapInstance.addLayer({
        id: 'guess-line',
        type: 'line',
        source: 'guess-line',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#f59e0b', 'line-width': 2, 'line-dasharray': [2, 2] },
      })

      line.current = true

      // Fit map to show both markers
      const bounds = new mapboxgl.LngLatBounds()
      bounds.extend([guessLocation.lng, guessLocation.lat])
      bounds.extend([correctLocation.lng, correctLocation.lat])
      mapInstance.fitBounds(bounds, { padding: 80, maxZoom: 6, duration: 1000 })
    }

    // Map may not be fully loaded yet
    if (mapInstance.isStyleLoaded()) {
      drawLine()
    } else {
      mapInstance.once('load', drawLine)
    }
  }, [correctLocation, guessLocation])

  // Clean up line and markers between rounds
  useEffect(() => {
    if (!correctLocation && !guessLocation) {
      if (correctMarker.current) {
        correctMarker.current.remove()
        correctMarker.current = null
      }
      if (map.current) {
        if (map.current.getLayer('guess-line')) map.current.removeLayer('guess-line')
        if (map.current.getSource('guess-line')) map.current.removeSource('guess-line')
        line.current = false
        map.current.flyTo({ center: [0, 20], zoom: 1.5, duration: 800 })
      }
    }
  }, [correctLocation, guessLocation])

  useEffect(() => {
    if (!map.current) return
    map.current.getCanvas().style.cursor = disabled ? 'default' : 'crosshair'
  }, [disabled])

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      {!disabled && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full pointer-events-none whitespace-nowrap">
          Click to place your guess
        </div>
      )}
      {disabled && correctLocation && (
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />
            Your guess
          </div>
          <div className="flex items-center gap-2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            Correct location
          </div>
        </div>
      )}
    </div>
  )
}