export type Mode = 'easy' | 'hard'

export type Location = {
  id: string
  lat: number
  lng: number
  ocean: string
  mode: Mode
  heading: number
}

export type Round = {
  location: Location
  guessLat: number | null
  guessLng: number | null
  distanceKm: number | null
  score: number | null
}

export type GameState = {
  mode: Mode
  rounds: Round[]
  currentRound: number
  totalScore: number
}