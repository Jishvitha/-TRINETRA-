// Database API layer for TRINETRA application
import { supabase } from './supabase';
import type { Alert, Sighting, AlertFormData, SightingFormData } from '@/types/index';

// Alert operations
export async function createAlert(data: AlertFormData): Promise<Alert | null> {
  const { data: alert, error } = await supabase
    .from('alerts')
    .insert({
      child_name: data.child_name,
      age: data.age,
      photo_url: data.photo_url,
      last_seen_location: data.last_seen_location,
      last_seen_lat: data.last_seen_lat,
      last_seen_lng: data.last_seen_lng,
      time_missing: data.time_missing,
      description: data.description,
      risk_level: data.risk_level,
      status: 'active'
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating alert:', error);
    return null;
  }

  return alert;
}

export async function getActiveAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active alerts:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function getResolvedAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('status', 'resolved')
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching resolved alerts:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function getAlertById(id: string): Promise<Alert | null> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching alert:', error);
    return null;
  }

  return data;
}

export async function updateAlertStatus(id: string, status: 'active' | 'resolved' | 'inactive'): Promise<boolean> {
  const { error } = await supabase
    .from('alerts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating alert status:', error);
    return false;
  }

  return true;
}

export async function deleteAlert(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('alerts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting alert:', error);
    return false;
  }

  return true;
}

// Sighting operations
export async function createSighting(data: SightingFormData): Promise<Sighting | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: sighting, error } = await supabase
    .from('sightings')
    .insert({
      alert_id: data.alert_id,
      location: data.location,
      lat: data.lat,
      lng: data.lng,
      description: data.description || null,
      reporter_contact: data.reporter_contact || null,
      reporter_id: user?.id || null,
      photo_url: data.photo_url || null
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating sighting:', error);
    return null;
  }

  return sighting;
}

export async function getSightingsByAlertId(alertId: string): Promise<Sighting[]> {
  const { data, error } = await supabase
    .from('sightings')
    .select('*')
    .eq('alert_id', alertId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sightings:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export async function getAllSightings(): Promise<Sighting[]> {
  const { data, error } = await supabase
    .from('sightings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching all sightings:', error);
    return [];
  }

  return Array.isArray(data) ? data : [];
}

// Real-time subscription for alerts
export function subscribeToAlerts(callback: (alert: Alert) => void) {
  const channel = supabase
    .channel('alerts-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts'
      },
      (payload) => {
        callback(payload.new as Alert);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
