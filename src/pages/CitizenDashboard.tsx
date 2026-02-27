// Citizen dashboard for viewing active alerts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw } from 'lucide-react';
import { AlertCard } from '@/components/AlertCard';
import { SightingDialog } from '@/components/SightingDialog';
import { getActiveAlerts, createSighting, subscribeToAlerts } from '@/db/api';
import type { Alert, SightingFormData } from '@/types/index';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlertId, setSelectedAlertId] = useState<string>('');
  const [selectedAlertName, setSelectedAlertName] = useState<string>('');
  const [showSightingDialog, setShowSightingDialog] = useState(false);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await getActiveAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToAlerts((newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
      toast.success('New alert received!', {
        description: `Missing: ${newAlert.child_name}, Age ${newAlert.age}`
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleReportSighting = (alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      setSelectedAlertId(alertId);
      setSelectedAlertName(alert.child_name);
      setShowSightingDialog(true);
    }
  };

  const handleViewMap = (alertId: string) => {
    // For simplified version, just show toast
    toast.info('Map view feature - Alert location displayed');
  };

  const handleSubmitSighting = async (data: SightingFormData) => {
    try {
      // Upload photo to Supabase Storage if it's a data URL
      let photoUrl = data.photo_url;
      
      if (photoUrl && photoUrl.startsWith('data:')) {
        // Convert data URL to blob
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        
        // Generate unique filename
        const fileName = `sighting_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        
        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('app-9wcfw5spx1q9_child_images')
          .upload(fileName, blob, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('app-9wcfw5spx1q9_child_images')
          .getPublicUrl(fileName);

        photoUrl = urlData.publicUrl;
      }

      const sighting = await createSighting({ ...data, photo_url: photoUrl });
      if (sighting) {
        toast.success('Sighting reported successfully!', {
          description: 'Authorities have been notified of your report.'
        });
      } else {
        toast.error('Failed to submit sighting');
      }
    } catch (error) {
      console.error('Error submitting sighting:', error);
      toast.error('An error occurred while submitting the sighting');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Citizen Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {profile?.username} • {alerts.length} active {alerts.length === 1 ? 'alert' : 'alerts'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={loadAlerts}
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">🚨 Active Alerts Near You</h2>
          <p className="text-muted-foreground">
            Help find missing children by reporting any sightings with photo evidence
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] w-full bg-muted" />
                <Skeleton className="h-6 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-full bg-muted" />
                <Skeleton className="h-4 w-2/3 bg-muted" />
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Active Alerts</h3>
            <p className="text-muted-foreground">
              There are currently no active missing child alerts in your area.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onReportSighting={handleReportSighting}
                onViewMap={handleViewMap}
              />
            ))}
          </div>
        )}
      </main>

      {/* Sighting Dialog */}
      <SightingDialog
        open={showSightingDialog}
        onOpenChange={setShowSightingDialog}
        alertId={selectedAlertId}
        childName={selectedAlertName}
        onSubmit={handleSubmitSighting}
      />

      {/* Footer */}
      <footer className="py-8 px-4 border-t mt-16">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground space-y-2">
          <p>© 2026 TRINETRA. Every second counts. Every eye matters.</p>
          <div className="flex justify-center gap-4">
            <button className="hover:text-primary transition-colors">About TRINETRA</button>
            <span>•</span>
            <button className="hover:text-primary transition-colors">Contact</button>
            <span>•</span>
            <button className="hover:text-primary transition-colors">Project Description</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
