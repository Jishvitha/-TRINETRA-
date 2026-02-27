// Login selection landing page
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function LoginSelection() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'police') {
        navigate('/police-dashboard');
      } else {
        navigate('/citizen-dashboard');
      }
    }
  }, [user, profile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">TRINETRA</h1>
          <p className="text-xl md:text-2xl text-primary font-semibold">
            Intelligent Rapid Alert System for Missing Children
          </p>
          <p className="text-muted-foreground">
            Every second counts. Every eye matters.
          </p>
        </div>

        {/* Login Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-2 hover:border-primary">
            <CardHeader className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10" />
              </div>
              <CardTitle className="text-2xl">Police / Authority</CardTitle>
              <CardDescription>
                Create and manage missing child alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate('/police-login')}
              >
                Login as Police
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-2 hover:border-primary">
            <CardHeader className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10" />
              </div>
              <CardTitle className="text-2xl">Citizen</CardTitle>
              <CardDescription>
                View alerts and report sightings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/citizen-login')}
              >
                Login as Citizen
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>© 2026 TRINETRA. Every second counts. Every eye matters.</p>
          <div className="flex justify-center gap-4">
            <button className="hover:text-primary transition-colors">About TRINETRA</button>
            <span>•</span>
            <button className="hover:text-primary transition-colors">Contact</button>
            <span>•</span>
            <button className="hover:text-primary transition-colors">Project Description</button>
          </div>
        </div>
      </div>
    </div>
  );
}
