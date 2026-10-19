// A single day's entry. Stored at users/{uid}/entries/{YYYY-MM-DD}.
export interface Entry {
  date: string; // YYYY-MM-DD
  overallFeeling: number; // 1 (rough day) – 5 (great day), 0 = not logged
  symptoms: string[];
  foods: string[];
  triggers: string[];
  mood: string[];
  period: boolean;
  notes: string;
  gratitude: string;
  updatedAt: number; // epoch ms
}

export const emptyEntry = (date: string): Entry => ({
  date,
  overallFeeling: 0,
  symptoms: [],
  foods: [],
  triggers: [],
  mood: [],
  period: false,
  notes: '',
  gratitude: '',
  updatedAt: 0,
});

export const MOOD_OPTIONS = ['Calm', 'Happy', 'Anxious', 'Low', 'Irritable', 'Tired', 'Energised'];

export const COMMON_SYMPTOMS = [
  'Fatigue',
  'Joint pain',
  'Headache',
  'Nausea',
  'Bloating',
  'Brain fog',
  'Flare-up',
  'Dizziness',
  'Rash',
  'Stomach pain',
];
