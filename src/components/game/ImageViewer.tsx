// src/components/game/ImageViewer.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Location } from '@/types'

declare global {
  interface Window {
    google: any
  }
}

type Props = {
  location: Location
  onInvalid?: (id: string) => void
}

export default function ImageViewer({ location, onInvalid }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const panoramaRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)

    if (location.mode === 'easy') {
      initStreetView()
    } else {
      initSatellite()
    }

    return () => {
      panoramaRef.current = null
    }
  }, [location])

  function waitForGoogle(cb: () => void) {
    if (window.google?.maps) {
      cb()
    } else {
      const interval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(interval)
          cb()
        }
      }, 100)
    }
  }

  function initStreetView() {
    waitForGoogle(() => {
      if (!containerRef.current) return

      const sv = new window.google.maps.StreetViewService()

      sv.getPanorama(
        {
          location: { lat: location.lat, lng: location.lng },
          radius: 1000,
          preference: window.google.maps.StreetViewPreference.NEAREST,
          source: window.google.maps.StreetViewSource.OUTDOOR,
        },
        (data: any, status: any) => {
          if (status !== 'OK') {
            onInvalid?.(location.id)
            setError(true)
            setLoading(false)
            return
          }

          setTimeout(() => {
            if (!containerRef.current) return

            panoramaRef.current = new window.google.maps.StreetViewPanorama(
              containerRef.current,
              {
                pano: data.location.pano,
                pov: { heading: location.heading ?? 0, pitch: 0 },
                zoom: 0,
                addressControl: false,
                showRoadLabels: false,
                motionTracking: false,
                motionTrackingControl: false,
                fullscreenControl: false,
                linksControl: false,
                panControl: true,
                zoomControl: true,
              }
            )

            setLoading(false)
          }, 200)
        }
      )
    })
  }

  function initSatellite() {
    waitForGoogle(() => {
      if (!containerRef.current) return

      panoramaRef.current = new window.google.maps.Map(containerRef.current, {
        center: { lat: location.lat, lng: location.lng },
        zoom: 8,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        draggable: false,         // lock so players can't pan to find landmarks
        scrollwheel: false,
        zoomControl: false,
        gestureHandling: 'none',
      })

      setLoading(false)
    })
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-xl">
        <div className="text-slate-400 text-sm">Finding another location...</div>
      </div>
    )
  }
  
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
          <div className="text-slate-400 animate-pulse">Loading location...</div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}