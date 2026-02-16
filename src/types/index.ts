export interface OracleVoiceSettings {
  pitch: number;
  rate: number;
  volume: number;
  voiceType: "female" | "male" | "neutral";
}

export interface Oracle {
  id: string;
  name: string;
  englishName: string;
  role: string;
  title: string;
  specialty: string;
  description: string;
  personality: string;
  greeting: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  icon: string;
  image: string;
  systemPrompt: string;
  isCore: boolean;
  voiceSettings: OracleVoiceSettings;
  placeholder: string;
  typingMessage: string;
  isNew?: boolean;
  detailedProfile?: string;
}

export interface ChatMessageType {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface FortunePillar {
  heavenlyStem: string;
  earthlyBranch: string;
  element: string;
}

export interface FortuneResult {
  yearPillar: FortunePillar;
  monthPillar: FortunePillar;
  dayPillar: FortunePillar;
  sixBeast: string;
  fiveElements: Record<string, number>;
  dominantElement: string;
  personality: string;
}

export interface CompatibilityResult {
  score: number;
  description: string;
  elements: {
    person1: string;
    person2: string;
    relation: string;
  };
}
