// Citizen login page with phone verification
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Loader2, ArrowLeft, CheckCircle2, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

type VerificationStep = 'phone' | 'otp' | 'signup' | 'login';

export default function CitizenLogin() {
  const navigate = useNavigate();
  const { signInWithUsername, signUpCitizenWithPhone, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<VerificationStep>('login');
  const [isSignup, setIsSignup] = useState(false);
  
  // Login state
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  
  // Phone verification state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  // Signup state
  const [signupData, setSignupData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signInWithUsername(loginData.username, loginData.password);
      
      if (error) {
        toast.error('Login failed: ' + error.message);
      } else {
        toast.success('Login successful!');
        navigate('/citizen-dashboard', { replace: true });
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const { error } = await sendPhoneOtp(phoneNumber);
      
      if (error) {
        toast.error('Failed to send OTP: ' + error.message);
      } else {
        setOtpSent(true);
        setStep('otp');
        toast.success('OTP sent to your phone number!');
      }
    } catch (error) {
      toast.error('An error occurred while sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const { error } = await verifyPhoneOtp(phoneNumber, otp);
      
      if (error) {
        toast.error('Invalid OTP: ' + error.message);
      } else {
        toast.success('Phone number verified successfully!');
        setStep('signup');
      }
    } catch (error) {
      toast.error('An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const { error } = await signUpCitizenWithPhone(phoneNumber, signupData.username, signupData.password);
      
      if (error) {
        toast.error('Signup failed: ' + error.message);
      } else {
        toast.success('Account created successfully!');
        setTimeout(() => {
          navigate('/citizen-dashboard', { replace: true });
        }, 1000);
      }
    } catch (error) {
      toast.error('An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const switchToSignup = () => {
    setIsSignup(true);
    setStep('phone');
  };

  const switchToLogin = () => {
    setIsSignup(false);
    setStep('login');
    setPhoneNumber('');
    setOtp('');
    setOtpSent(false);
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
            <CardTitle className="text-2xl">Citizen Access</CardTitle>
            <CardDescription>
              {step === 'login' ? 'Login to view alerts and report sightings' : 'Register with phone verification'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Toggle between Login and Signup */}
            {(step === 'login' || step === 'phone') && (
              <div className="flex gap-2 mb-6">
                <Button
                  variant={!isSignup ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={switchToLogin}
                >
                  Login
                </Button>
                <Button
                  variant={isSignup ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={switchToSignup}
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Login Form */}
            {step === 'login' && (
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
            )}

            {/* Phone Verification Step */}
            {step === 'phone' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <Alert className="bg-primary/10 border-primary">
                  <Phone className="w-4 h-4" />
                  <AlertDescription>
                    Step 1: Verify your phone number with OTP
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your phone number with country code (e.g., +1234567890)
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </form>
            )}

            {/* OTP Verification Step */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <Alert className="bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]">
                  <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))]" />
                  <AlertDescription className="text-[hsl(var(--success))]">
                    OTP sent to {phoneNumber}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP *</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('phone')}
                    disabled={loading}
                  >
                    Change Number
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Signup Form (After Phone Verification) */}
            {step === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
                <Alert className="bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]">
                  <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))]" />
                  <AlertDescription className="text-[hsl(var(--success))]">
                    Phone verified! Complete your registration
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username *</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="Choose a username"
                    value={signupData.username}
                    onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password *</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Choose a password (min 6 characters)"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password *</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
