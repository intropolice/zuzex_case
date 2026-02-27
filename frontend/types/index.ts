export interface Pet {
  id: string;
  name: string;
  hunger: number;
  energy: number;
  mood: number;
  health: number;
  status: 'Happy' | 'Okay' | 'Sad' | 'Sick' | 'Sleeping' | 'Dead' | 'healthy' | 'dead';
  lastUpdated: string;
  createdAt: string;
}

export interface GameState {
  pet: Pet | null;
  loading: boolean;
  error: string | null;
}

export interface ActionResponse {
  success: boolean;
  pet: Pet;
  message: string;
}
