// src/components/game/ScoreDisplay.tsx
'use client'

type Props = {
  score: number
  distanceKm: number
  round: number
  totalRounds: number
}

export default function ScoreDisplay({ score, distanceKm, round, totalRounds }: Props) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 text-white text-center space-y-1">
      <p className="text-slate-400 text-xs uppercase tracking-widest">
        Round {round} of {totalRounds}
      </p>
      <p className="text-4xl font-bold text-teal-400">{score.toLocaleString()}</p>
      <p className="text-slate-300 text-sm">
        {distanceKm < 1
          ? 'Less than 1 km away'
          : `${Math.round(distanceKm).toLocaleString()} km away`}
      </p>
    </div>
  )
}