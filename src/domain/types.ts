export type Tone = "familiar" | "amigos" | "adulto";

export type GameMode = "classic" | "modifiers" | "custom-scale";

export type Team = {
  id: string;
  name: string;
  score: number;
};

export type Scale = {
  id: string;
  categoryId: string;
  leftLabel: string;
  rightLabel: string;
  tone: Tone;
  enabled: boolean;
};

export type Modifier = {
  id: string;
  title: string;
  instruction: string;
  compatibleModes: GameMode[];
};

export type GameSession = {
  id: string;
  mode: GameMode;
  tones: Tone[];
  /** Legacy field kept only so old local snapshots can be migrated safely. */
  tone?: Tone;
  teams: Team[];
  currentTeamIndex: number;
  currentRound: number;
  totalRounds: number;
  selectedScaleId: string | null;
  currentModifierId: string | null;
  customScale: { leftLabel: string; rightLabel: string; tag?: string } | null;
  targetPosition: number | null;
  clue: string | null;
  needlePosition: number | null;
  revealed: boolean;
};

export type ScoreBand = 0 | 1 | 2 | 3 | 4;
