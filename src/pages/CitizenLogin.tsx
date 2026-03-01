// Citizen login page
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CitizenLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithUsername, signUpWithUsername } = useAuth();
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({ username: '', password: '', confirmPassword: '' });

  // 🔹 OTP STATES (Added)
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signInWithUsername(loginData.username, loginData.password);
      
      if (error) {
        toast.error('Login failed: ' + error.message);
      } else {
        toast.success('Login successful!');
        const from = (location.state as any)?.from || '/citizen-dashboard';
        navigate(from, { replace: true });
      }
    } catch {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 SEND OTP (Added)
  const handleSendOtp = () => {
    if (!/^[0-9]{10}$/.test(phone)) {
      toast.error('Enter valid 10-digit phone number');
      return;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpCode);
    setOtpSent(true);

    console.log('Demo OTP:', otpCode);
    toast.success('OTP sent successfully');
  };

  // 🔹 VERIFY OTP (Added)
  const handleVerifyOtp = () => {
    if (otp.trim() === generatedOtp) {
      setOtpVerified(true);
      toast.success('Phone number verified');
    } else {
      toast.error('Invalid OTP');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔹 BLOCK IF NOT VERIFIED (Added)
    if (!otpVerified) {
      toast.error('Verify phone number first');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUpWithUsername(signupData.username, signupData.password);
      
      if (error) {
        toast.error('Signup failed: ' + error.message);
      } else {
        toast.success('Account created! Logging in...');
        setTimeout(() => {
          navigate('/citizen-dashboard', { replace: true });
        }, 1000);
      }
    } catch {
      toast.error('An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Selection
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl">Citizen Login</CardTitle>
            <CardDescription>
              Access the citizen dashboard to view alerts and report sightings
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* LOGIN TAB (UNCHANGED) */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* SIGNUP TAB (OTP ADDED ONLY) */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">

                  {/* 🔹 PHONE FIELD */}
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter 10-digit phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={otpVerified}
                      />
                      <Button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpVerified}
                      >
                        Send OTP
                      </Button>
                    </div>
                  </div>

                  {/* 🔹 OTP FIELD */}
                  {otpSent && !otpVerified && (
                    <div className="space-y-2">
                      <Label>Enter OTP</Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                        <Button type="button" onClick={handleVerifyOtp}>
                          Verify
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* EXISTING FIELDS (ONLY DISABLED UNTIL VERIFIED) */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Choose a username"
                      value={signupData.username}
                      onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                      required
                      disabled={!otpVerified}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Choose a password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                      disabled={!otpVerified}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      required
                      disabled={!otpVerified}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={!otpVerified || loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Sign Up'
                    )}
                  </Button>

                </form>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}