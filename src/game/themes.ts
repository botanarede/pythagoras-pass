export type GamePhaseId = 1 | 2 | 3;

export interface PhaseTheme {
  id: GamePhaseId;
  name: string;
  stadiumName: string;
  timeOfDay: 'day' | 'sunset' | 'night';
  grassBaseColor: string;
  grassStripeColor: string;
  skyColor: string;
  bannerColors: string[];
  passerJersey: string;
  passerShorts: string;
  passerTrim: string;
  attackerJersey: string;
  attackerShorts: string;
  attackerTrim: string;
}

export const PHASE_THEMES: Record<GamePhaseId, PhaseTheme> = {
  1: {
    id: 1,
    name: 'Bahia',
    stadiumName: 'Arena Fonte Nova',
    timeOfDay: 'day',
    grassBaseColor: '#15803d',
    grassStripeColor: 'rgba(255, 255, 255, 0.05)',
    skyColor: '#0f172a',
    bannerColors: ['#1d4ed8', '#dc2626', '#ffffff', '#1d4ed8', '#dc2626', '#ffffff'],
    passerJersey: '#1d4ed8',
    passerShorts: '#ffffff',
    passerTrim: '#dc2626',
    attackerJersey: '#ffffff',
    attackerShorts: '#1d4ed8',
    attackerTrim: '#dc2626',
  },
  2: {
    id: 2,
    name: 'Flamengo',
    stadiumName: 'Maracanã',
    timeOfDay: 'sunset',
    grassBaseColor: '#166534',
    grassStripeColor: 'rgba(251, 146, 60, 0.06)',
    skyColor: '#26121e',
    bannerColors: ['#dc2626', '#0f172a', '#dc2626', '#0f172a', '#dc2626', '#0f172a'],
    passerJersey: '#dc2626',
    passerShorts: '#0f172a',
    passerTrim: '#0f172a',
    attackerJersey: '#ffffff',
    attackerShorts: '#dc2626',
    attackerTrim: '#0f172a',
  },
  3: {
    id: 3,
    name: 'Cruzeiro',
    stadiumName: 'Mineirão',
    timeOfDay: 'night',
    grassBaseColor: '#14532d',
    grassStripeColor: 'rgba(56, 189, 248, 0.05)',
    skyColor: '#080d1a',
    bannerColors: ['#1e40af', '#ffffff', '#1e40af', '#ffffff', '#1e40af', '#ffffff'],
    passerJersey: '#1e40af',
    passerShorts: '#ffffff',
    passerTrim: '#38bdf8',
    attackerJersey: '#ffffff',
    attackerShorts: '#1e40af',
    attackerTrim: '#1e40af',
  },
};

export function getPhaseTheme(phaseId: GamePhaseId): PhaseTheme {
  return PHASE_THEMES[phaseId] || PHASE_THEMES[1];
}

export function getNextPhase(current: GamePhaseId): GamePhaseId | null {
  if (current === 1) return 2;
  if (current === 2) return 3;
  return null;
}

export function isLastPhase(current: GamePhaseId): boolean {
  return current === 3;
}
