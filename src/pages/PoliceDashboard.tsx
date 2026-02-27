// Police dashboard for creating and managing alerts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, CheckCircle2, Clock, Shield } from 'lucide-react';
import { AlertForm } from '@/components/AlertForm';
import { createAlert, getActiveAlerts, getResolvedAlerts, updateAlertStatus } from '@/db/api';
import type { AlertFormData, Alert } from '@/types/index';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function PoliceDashboard() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [resolvedAlerts, setResolvedAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [alertToResolve, setAlertToResolve] = useState<string | null>(null);

  // Redirect if not police or not verified
  useEffect(() => {
    if (profile) {
      if (profile.role !== 'police') {
        toast.error('Access denied. Police access only.');
        navigate('/citizen-dashboard');
      } else if (!profile.verified) {
        toast.error('Your account is not verified. Please contact administrator.');
        navigate('/');
      }
    }
  }, [profile, navigate]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const [active, resolved] = await Promise.all([
        getActiveAlerts(),
        getResolvedAlerts()
      ]);
      setActiveAlerts(active);
      setResolvedAlerts(resolved);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleSubmit = async (data: AlertFormData) => {
    try {
      const alert = await createAlert(data);
      if (alert) {
        setShowSuccess(true);
        toast.success('Alert activated successfully!');
        loadAlerts();
      } else {
        toast.error('Failed to create alert');
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      toast.error('An error occurred while creating the alert');
    }
  };

  const handleMarkAsFound = async (alertId: string) => {
    try {
      const success = await updateAlertStatus(alertId, 'resolved');
      if (success) {
        toast.success('Alert marked as resolved!');
        loadAlerts();
        setAlertToResolve(null);
      } else {
        toast.error('Failed to update alert status');
      }
    } catch (error) {
      console.error('Error updating alert:', error);
      toast.error('An error occurred');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-[hsl(var(--warning))] text-white';
      case 'low':
        return 'bg-[hsl(var(--success))] text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">Police Dashboard</h1>
              <Badge variant="outline" className="bg-primary/10">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {profile?.full_name || profile?.username} • {profile?.police_station}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Create New Alert Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Create New Alert</h2>
          <AlertForm onSubmit={handleSubmit} />
        </section>

        {/* Active Alerts Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Active Alerts</h2>
            <Badge variant="outline" className="text-base">
              {activeAlerts.length} Active
            </Badge>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : activeAlerts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No active alerts at the moment
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAlerts.map((alert) => (
                <Card key={alert.id}>
                  <CardHeader className="pb-3">
                    <div className="aspect-[4/3] -mx-6 -mt-6 mb-3 overflow-hidden rounded-t-lg">
                      <img
                        src={alert.photo_url}
                        alt={alert.child_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">{alert.child_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">Age: {alert.age}</p>
                      </div>
                      <Badge className={getRiskColor(alert.risk_level)}>
                        {alert.risk_level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">📍 {alert.last_seen_location}</p>
                      <p className="text-muted-foreground">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatDistanceToNow(new Date(alert.time_missing), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => setAlertToResolve(alert.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Found
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Resolved Cases Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Resolved Cases</h2>
            <Badge variant="outline" className="text-base bg-[hsl(var(--success))]/10">
              {resolvedAlerts.length} Resolved
            </Badge>
          </div>

          {resolvedAlerts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No resolved cases yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {resolvedAlerts.map((alert) => (
                <Card key={alert.id} className="opacity-75">
                  <CardHeader className="pb-2">
                    <div className="aspect-square -mx-6 -mt-6 mb-2 overflow-hidden rounded-t-lg">
                      <img
                        src={alert.photo_url}
                        alt={alert.child_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-base">{alert.child_name}</CardTitle>
                    <Badge className="bg-[hsl(var(--success))] text-white w-fit">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Resolved
                    </Badge>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--success))]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[hsl(var(--success))]" />
            </div>
            <DialogTitle className="text-center text-2xl">Alert Activated!</DialogTitle>
            <DialogDescription className="text-center">
              The missing child alert has been successfully created and activated. Citizens will be notified immediately.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowSuccess(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>

      {/* Confirm Resolve Dialog */}
      <AlertDialog open={!!alertToResolve} onOpenChange={() => setAlertToResolve(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Alert as Found?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the alert as resolved and remove it from the active alerts list. This action can help focus resources on other cases.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => alertToResolve && handleMarkAsFound(alertToResolve)}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
