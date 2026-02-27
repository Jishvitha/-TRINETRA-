export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

// Auth types
export type UserRole = 'police' | 'citizen';

export interface Profile {
  id: string;
  username: string;
  email: string | null;
  role: UserRole;
  full_name?: string | null;
  official_email?: string | null;
  police_id?: string | null;
  police_station?: string | null;
  id_proof_url?: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface PoliceRegistrationData {
  full_name: string;
  official_email: string;
  username: string;
  password: string;
  police_id: string;
  police_station: string;
  id_proof_url?: string;
}

export interface PoliceIdVerification {
  is_valid: boolean;
  station_name: string | null;
}

// TRINETRA types
export type RiskLevel = 'low' | 'medium' | 'high';
export type AlertStatus = 'active' | 'resolved' | 'inactive';

export interface Alert {
  id: string;
  child_name: string;
  age: number;
  photo_url: string;
  last_seen_location: string;
  last_seen_lat?: number;
  last_seen_lng?: number;
  time_missing: string;
  description: string;
  risk_level: RiskLevel;
  status: AlertStatus;
  created_at: string;
  updated_at: string;
}

export interface Sighting {
  id: string;
  alert_id: string;
  location: string;
  lat?: number;
  lng?: number;
  description?: string;
  reporter_contact?: string;
  reporter_id?: string;
  photo_url?: string;
  created_at: string;
}

export interface AlertFormData {
  child_name: string;
  age: number;
  photo_url: string;
  last_seen_location: string;
  last_seen_lat?: number;
  last_seen_lng?: number;
  time_missing: string;
  description: string;
  risk_level: RiskLevel;
}

export interface SightingFormData {
  alert_id: string;
  location: string;
  lat?: number;
  lng?: number;
  description?: string;
  reporter_contact?: string;
  photo_url?: string;
}

