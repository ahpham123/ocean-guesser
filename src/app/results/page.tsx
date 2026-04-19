// src/app/results/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Mode } from '@/types'
import confetti from 'canvas-confetti'

type ScoreEntry = {
  id: string
  player_name: string
  score: number
  mode: string
  created_at: string
}

function getScoreMessage(score: number, mode: Mode): { title: string } {
  if (mode === 'easy') {
    if (score >= 20000) return {
      title: "Rainbolt?! 🤯",
    }
    if (score >= 15000) return {
      title: "GOAT behavior?",
    }
    if (score >= 10000) return {
      title: "Great job!",
    }
    if (score >= 4000) return {
      title: "Good work.",
    }
    return {
      title: "",
    }
  }

  // Hard mode
  if (score >= 2000) return {
    title: "Great job!"
  }
  return {
    title: "",
  }
}

function shouldShowConfetti(score: number, mode: Mode): boolean {
  if (mode === 'easy') return score >= 10000
  return score >= 2000
}

function fireConfetti() {
  const positions = [
    { x: 0.05, y: 0.25 },
    { x: 0.10, y: 0.55 },
    { x: 0.15, y: 0.35 },
    { x: 0.20, y: 0.70 },
    { x: 0.25, y: 0.45 },
    { x: 0.30, y: 0.25 },
    { x: 0.35, y: 0.60 },
    { x: 0.40, y: 0.75 },
    { x: 0.45, y: 0.30 },
    { x: 0.50, y: 0.50 },
    { x: 0.55, y: 0.65 },
    { x: 0.60, y: 0.22 },
    { x: 0.65, y: 0.40 },
    { x: 0.70, y: 0.72 },
    { x: 0.75, y: 0.35 },
    { x: 0.80, y: 0.55 },
    { x: 0.85, y: 0.28 },
    { x: 0.90, y: 0.68 },
    { x: 0.95, y: 0.42 },
    { x: 0.50, y: 0.78 },
    { x: 0.05, y: 0.85 },
    { x: 0.10, y: 0.90 },
    { x: 0.15, y: 0.87 },
    { x: 0.20, y: 0.92 },
    { x: 0.25, y: 0.86 },
    { x: 0.30, y: 0.91 },
    { x: 0.35, y: 0.88 },
    { x: 0.40, y: 0.93 },
    { x: 0.45, y: 0.85 },
    { x: 0.50, y: 0.89 },
    { x: 0.55, y: 0.87 },
    { x: 0.60, y: 0.92 },
    { x: 0.65, y: 0.86 },
    { x: 0.70, y: 0.90 },
    { x: 0.75, y: 0.88 },
    { x: 0.80, y: 0.93 },
    { x: 0.85, y: 0.85 },
    { x: 0.90, y: 0.91 },
    { x: 0.95, y: 0.87 },
    { x: 0.50, y: 0.95 },
  ]

  positions.forEach(({ x, y }) => {
    confetti({
      particleCount: 40,
      angle: 90,
      spread: 60,
      origin: { x, y },
      colors: ['#14b8a6', '#6366f1', '#f59e0b', '#f43f5e', '#ffffff'],
    })
  })
}

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const score = parseInt(searchParams.get('score') ?? '0')
  const mode = (searchParams.get('mode') ?? 'easy') as Mode

  const [playerName, setPlayerName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([])
  const [playerRank, setPlayerRank] = useState<number | null>(null)

  useEffect(() => {
  if (!shouldShowConfetti(score, mode)) return

  // Small delay so the page renders first
  const timeout = setTimeout(() => {
    fireConfetti()

    // Extra burst for perfect/near-perfect scores
    if ((mode === 'easy' && score >= 20000) || (mode === 'hard' && score >= 2000)) {
      setTimeout(fireConfetti, 600)
      setTimeout(fireConfetti, 1200)
    }
  }, 300)

  return () => clearTimeout(timeout)
}, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [mode])

  async function fetchLeaderboard() {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('mode', mode)
      .order('score', { ascending: false })
      .limit(10)

    if (data) setLeaderboard(data)
  }

  async function handleSubmitScore() {
    if (!playerName.trim() || submitting) return
    setSubmitting(true)

    const { error } = await supabase.from('scores').insert({
      player_name: playerName.trim(),
      score,
      mode,
    })

    if (!error) {
      setSubmitted(true)
      await fetchLeaderboard()

      // Calculate rank
      const { count } = await supabase
        .from('scores')
        .select('*', { count: 'exact', head: true })
        .eq('mode', mode)
        .gt('score', score)

      setPlayerRank((count ?? 0) + 1)
    }

    setSubmitting(false)
  }

  const maxScore = leaderboard[0]?.score ?? score

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Score card */}
        <div className="bg-slate-900 rounded-2xl p-8 text-center border border-slate-800">
          {(() => {
            const { title } = getScoreMessage(score, mode)
            return (
              <>
                <p className="text-2xl font-bold text-white mb-1">{title}</p>
              </>
            )
          })()}
          <p className="text-slate-400 text-sm uppercase tracking-widest mb-2">Your Score</p>
          <p className="text-6xl font-bold text-teal-400 mb-1">{score.toLocaleString()}</p>
          <p className="text-slate-500 text-sm capitalize">{mode} mode · 5 rounds</p>
          {playerRank && (
            <p className="mt-3 text-amber-400 text-sm font-medium">
              You ranked #{playerRank} on the leaderboard
            </p>
          )}
        </div>

        {/* Name input */}
        {!submitted ? (
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
            <p className="text-sm text-slate-300 text-center">Enter your name for the leaderboard</p>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitScore()}
              placeholder="Your name..."
              maxLength={24}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
            <button
              onClick={handleSubmitScore}
              disabled={!playerName.trim() || submitting}
              className="w-full py-3 rounded-xl font-bold bg-teal-500 hover:bg-teal-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Score'}
            </button>
          </div>
        ) : (
          <div className="text-center text-slate-400 text-sm">
            Score submitted as <span className="text-white font-medium">{playerName}</span>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-white">Leaderboard</h2>
            <span className="text-slate-500 text-xs capitalize">{mode} mode</span>
          </div>
          <div className="divide-y divide-slate-800">
            {leaderboard.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-6">No scores yet</p>
            )}
            {leaderboard.map((entry, i) => {
              const isPlayer = submitted && entry.player_name === playerName && entry.score === score
              const barWidth = Math.round((entry.score / maxScore) * 100)

              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 px-6 py-3 ${isPlayer ? 'bg-teal-950/40' : ''}`}
                >
                  <span className={`text-sm font-mono w-5 text-center ${i === 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm truncate ${isPlayer ? 'text-teal-400 font-medium' : 'text-white'}`}>
                        {entry.player_name}
                        {isPlayer && ' (you)'}
                      </span>
                      <span className="text-sm font-mono text-slate-300 ml-2">
                        {entry.score.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${i === 0 ? 'bg-amber-400' : 'bg-slate-600'}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Play again */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/play?mode=${mode}`)}
            className="flex-1 py-3 rounded-xl font-bold bg-[#2f2bd4] hover:bg-[#5855dd] transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Return to Home
          </button>
        </div>

      </div>
    </div>
  )
}