// src/app/results/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Mode } from '@/types'

type ScoreEntry = {
  id: string
  player_name: string
  score: number
  mode: string
  created_at: string
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
            className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Change Mode
          </button>
        </div>

      </div>
    </div>
  )
}