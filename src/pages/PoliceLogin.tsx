// Police registration page with ID verification
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2, ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/db/supabase';

export default function PoliceLogin() {
  const navigate = useNavigate();
  const { signInWithUsername, signUpPolice, verifyPoliceId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  // Login state
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  
  // Registration state
  const [regData, setRegData] = useState({
    full_name: '',
    official_email: '',
    username: '',
    password: '',
    confirmPassword: '',
    police_id: '',
    police_station: ''
  });
  
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verified' | 'failed'>('idle');
  const [verifiedStation, setVerifiedStation] = useState<string>('');
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signInWithUsername(loginData.username, loginData.password);
      
      if (error) {
        toast.error('Login failed: ' + error.message);
      } else {
        toast.success('Login successful!');
        navigate('/police-dashboard', { replace: true });
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPoliceId = async () => {
    if (!regData.police_id) {
      toast.error('Please enter Police ID');
      return;
    }

    setVerifying(true);
    try {
      const result = await verifyPoliceId(regData.police_id);
      
      if (result.is_valid && result.station_name) {
        setVerificationStatus('verified');
        setVerifiedStation(result.station_name);
        setRegData({ ...regData, police_station: result.station_name });
        toast.success('✅ Police ID Verified – Registration Approved');
      } else {
        setVerificationStatus('failed');
        toast.error('❌ Invalid Police ID – Access Denied');
      }
    } catch (error) {
      setVerificationStatus('failed');
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleIdProofUpload = async (file: File): Promise<string | null> => {
    try {
      setUploadProgress(0);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `id_proof_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      setUploadProgress(50);

      // Upload to storage
      const { data, error } = await supabase.storage
        .from('app-9wcfw5spx1q9_child_images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      setUploadProgress(75);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('app-9wcfw5spx1q9_child_images')
        .getPublicUrl(fileName);

      setUploadProgress(100);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (verificationStatus !== 'verified') {
      toast.error('Please verify your Police ID first');
      return;
    }

    if (regData.password !== regData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (regData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Upload ID proof if provided
      let idProofUrl: string | undefined;
      if (idProofFile) {
        toast.info('Uploading ID proof...');
        idProofUrl = await handleIdProofUpload(idProofFile) || undefined;
      }

      // Register police account
      const { error } = await signUpPolice({
        full_name: regData.full_name,
        official_email: regData.official_email,
        username: regData.username,
        password: regData.password,
        police_id: regData.police_id,
        police_station: regData.police_station,
        id_proof_url: idProofUrl
      });
      
      if (error) {
        toast.error('Registration failed: ' + error.message);
      } else {
        toast.success('Police account created successfully!');
        setTimeout(() => {
          navigate('/police-dashboard', { replace: true });
        }, 1000);
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
      <div className="w-full max-w-2xl">
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
              <Shield className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl">Police / Authority Access</CardTitle>
            <CardDescription>
              Secure authentication for authorized personnel only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6">
              <Button
                variant={isLogin ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setIsLogin(true)}
              >
                Login
              </Button>
              <Button
                variant={!isLogin ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setIsLogin(false)}
              >
                Register
              </Button>
            </div>

            {isLogin ? (
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
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Police ID Verification Section */}
                <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Step 1: Police ID Verification</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="police_id">Police ID Number *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="police_id"
                        type="text"
                        placeholder="Enter Police ID (e.g., POL001)"
                        value={regData.police_id}
                        onChange={(e) => {
                          setRegData({ ...regData, police_id: e.target.value });
                          setVerificationStatus('idle');
                        }}
                        required
                        disabled={verificationStatus === 'verified'}
                      />
                      <Button
                        type="button"
                        onClick={handleVerifyPoliceId}
                        disabled={verifying || verificationStatus === 'verified' || !regData.police_id}
                      >
                        {verifying ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : verificationStatus === 'verified' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Verified
                          </>
                        ) : (
                          'Verify'
                        )}
                      </Button>
                    </div>
                  </div>

                  {verificationStatus === 'verified' && (
                    <Alert className="bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]">
                      <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))]" />
                      <AlertDescription className="text-[hsl(var(--success))]">
                        ✅ Police ID Verified – Registration Approved
                        <br />
                        <span className="text-sm">Station: {verifiedStation}</span>
                      </AlertDescription>
                    </Alert>
                  )}

                  {verificationStatus === 'failed' && (
                    <Alert className="bg-destructive/10 border-destructive">
                      <XCircle className="w-4 h-4 text-destructive" />
                      <AlertDescription className="text-destructive">
                        ❌ Invalid Police ID – Access Denied
                        <br />
                        <span className="text-sm">Please enter a valid Police ID to continue</span>
                      </AlertDescription>
                    </Alert>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Demo IDs: POL001, POL002, POL003, POL004, POL005, DEMO123
                  </p>
                </div>

                {/* Registration Form - Only show after verification */}
                {verificationStatus === 'verified' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        type="text"
                        placeholder="Enter your full name"
                        value={regData.full_name}
                        onChange={(e) => setRegData({ ...regData, full_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="official_email">Official Email ID *</Label>
                      <Input
                        id="official_email"
                        type="email"
                        placeholder="your.email@police.gov"
                        value={regData.official_email}
                        onChange={(e) => setRegData({ ...regData, official_email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="police_station">Police Station Name *</Label>
                      <Input
                        id="police_station"
                        type="text"
                        value={regData.police_station}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Auto-filled from verification</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg_username">Username *</Label>
                      <Input
                        id="reg_username"
                        type="text"
                        placeholder="Choose a username"
                        value={regData.username}
                        onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg_password">Password *</Label>
                      <Input
                        id="reg_password"
                        type="password"
                        placeholder="Choose a password (min 6 characters)"
                        value={regData.password}
                        onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirm Password *</Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        placeholder="Confirm your password"
                        value={regData.confirmPassword}
                        onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="id_proof">Upload ID Proof (Optional)</Label>
                      <Input
                        id="id_proof"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setIdProofFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <Progress value={uploadProgress} />
                      )}
                      <p className="text-xs text-muted-foreground">
                        Optional for demo purposes
                      </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Police Account'
                      )}
                    </Button>
                  </>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
