// src/components/game/ImageViewer.tsx
'use client'

import { useEffect, useState } from 'react'
import { Location } from '@/types'

type Props = {
  location: Location
  onInvalid?: (id: string) => void
}

export default function ImageViewer({ location, onInvalid }: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    setImageSrc(null)

    if (location.mode === 'easy') {
      fetchStreetView()
    } else {
      loadSatellite()
    }
  }, [location])

  async function fetchStreetView() {
    try {
      const res = await fetch(
        `/api/streetview?lat=${location.lat}&lng=${location.lng}&heading=${location.heading}`
      )
      if (!res.ok) {
        onInvalid?.(location.id)
        setError(true)
        return
      }
      const { imageUrl } = await res.json()
      setImageSrc(imageUrl)
    } catch {
      onInvalid?.(location.id)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  function loadSatellite() {
    const url = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${location.lng},${location.lat},5/800x600?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
    const img = new Image()
    img.onload = () => {
      setImageSrc(url)
      setLoading(false)
    }
    img.onerror = () => {
      onInvalid?.(location.id)
      setError(true)
      setLoading(false)
    }
    img.src = url
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-xl">
        <div className="text-slate-400 animate-pulse">Loading image...</div>
      </div>
    )
  }

  if (error || !imageSrc) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-xl">
        <div className="text-slate-400 text-sm">Finding another location...</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <img
        src={imageSrc}
        alt="Guess this location"
        className="w-full h-full object-cover"
      />
      <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full capitalize">
        {location.ocean} Ocean
      </div>
    </div>
  )
}