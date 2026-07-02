// All API TypeScript types matching the backend contracts exactly

// ── Filters ──────────────────────────────────────────────────────────────────
export interface FiltersResponse {
  fuelTypes: string[];
  bodyTypes: string[];
  transmissions: string[];
  priorities: string[];
}

// ── Recommendation ────────────────────────────────────────────────────────────
export interface RecommendationRequest {
  budget: number;
  fuelType: string;
  bodyType: string;
  familySize: number;
  dailyRunningKm: number;
  transmission: string;
  priority: string;
}

export interface RecommendedCar {
  carId: string;
  brand: string;
  model: string;
  variant: string;
  price: number;
  matchScore: number;
  aiExplanation: string;
}

export interface RecommendationResponse {
  recommendationId: string;
  recommendedCars: RecommendedCar[];
}

// ── Car Details ───────────────────────────────────────────────────────────────
export interface CarDetail {
  id: string;
  brand: string;
  model: string;
  varient: string;   // intentional typo from backend
  bodyType: string;
  fuelType: string;
  transmission: string;
  seatingCapacity: number;
  price: number;
  mileage: number;
  engineCc: number;
  powerBhp: number;
  torqueNm: number;
  safetyRating: number;
  bootSpace: number;
  groundClearance: number;
  sunroof: boolean;
  adas: boolean;
  airbags: number;
  abs: boolean;
  esc: boolean;
  cruiseControl: boolean;
  touchScreen: boolean;
  alloyWheel: boolean;
  rating: number;
  imageUrl: string;
}

// ── Compare ───────────────────────────────────────────────────────────────────
export interface CompareRequest {
  carIds: [string, string];
}

export interface CompareCarSummary {
  carId: string;
  brand: string;
  model: string;
  variant: string;
  price: number;
  mileage: number;
  engineCc: number;
  safetyRating: number;
  groundClearance: number;
  bootSpace: number;
  airbags: number;
  adas: boolean;
}

export interface CompareResponse {
  car1: CompareCarSummary;
  car2: CompareCarSummary;
  winner: string;
  aiSummary: string;
}

// ── AI Explanation ────────────────────────────────────────────────────────────
export interface AIExplanationRequest {
  recommendationId: string;
  selectedCarId: string;
}

export interface AIExplanationResponse {
  carId: string;
  explanation: string;
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export interface ChatRequest {
  recommendationId: string;
  message: string;
}

export interface ChatResponse {
  reply: string;
}

// ── Error ─────────────────────────────────────────────────────────────────────
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details: string[];
}
