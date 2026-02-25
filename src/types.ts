export interface Profile {
  age: number;
  gender: string;
  weight: number;
  height: number;
  goal: string;
  conditions: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
}

export interface LogEntry {
  id?: number;
  date: string;
  type: 'meal' | 'exercise' | 'sleep' | 'water' | 'mood';
  content: any;
  created_at?: string;
}

export interface DailyStats {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  exerciseMinutes: number;
  sleepMinutes: number;
}
