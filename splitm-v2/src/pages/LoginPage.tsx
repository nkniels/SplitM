import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Phone, KeyRound } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { SplitMLogo } from '../components/common/SplitMLogo';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  setupRecaptcha, 
  sendPhoneOtp, 
  verifyPhoneOtp 
} from '../modules/auth/auth.service';
import { cn } from '../core/utils/helpers';
import type { ConfirmationResult } from 'firebase/auth';

type Tab = 'signin' | 'register' | 'phone';

// Simple Google SVG icon
const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 10-1.8 13.7-4.9l-6.3-5.2C29.5 35.6 26.9 36.5 24 36.5c-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.8 39.9 16.4 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.5-2.4 4.6-4.5 6l6.3 5.2C40.8 35.8 44 30.2 44 24c0-1.3-.1-2.7-.4-4z" />
  </svg>
);

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete: string;
  error?: string;
}

// Wraps Input with a show/hide toggle for passwords
function PasswordField({ label, value, onChange, autoComplete, error }: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        label={label}
        type={show ? 'text' : 'password'}
        placeholder="••••••••"
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        leftIcon={<Lock className="h-4 w-4" />}
        error={error}
        required
        className="pr-10"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 bottom-2.5 text-slate-400 hover:text-slate-200 focus:outline-none"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('signin');
  const [isLoading, setIsLoading] = useState(false);

  // Sign-in fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Register fields
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [confirmError, setConfirmError] = useState('');

  // Phone Auth fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginWithEmail(signInEmail, signInPassword);
      navigate('/');
    } catch (err: any) {
      toast(err.message ?? 'Sign in failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      toast(err.message ?? 'Google sign in failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirm) {
      setConfirmError('Passwords do not match.');
      return;
    }
    setConfirmError('');
    setIsLoading(true);
    try {
      await registerWithEmail(regEmail, regPassword);
      navigate('/');
    } catch (err: any) {
      toast(err.message ?? 'Registration failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast('Please enter a valid phone number with country code.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const verifier = setupRecaptcha('recaptcha-container');
      const result = await sendPhoneOtp(phoneNumber.trim(), verifier);
      setConfirmationResult(result);
      setOtpSent(true);
      toast('SMS verification code sent! Check your phone.', 'success');
    } catch (err: any) {
      toast(err.message ?? 'Failed to send verification SMS.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !otpCode.trim()) {
      toast('Please enter the 6-digit verification code.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await verifyPhoneOtp(confirmationResult, otpCode.trim());
      toast('Phone verified successfully!', 'success');
      navigate('/');
    } catch (err: any) {
      toast(err.message ?? 'Invalid verification code. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <Link
            to="/preview"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/25 transition-colors mb-3 border border-accent/20"
          >
            Explore Dashboard (Design Review) &rarr;
          </Link>
          <div className="flex justify-center mb-2">
            <SplitMLogo size="lg" textSize="2xl" />
          </div>
          <p className="text-slate-400 mt-2 text-sm">Split expenses, not friendships.</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'signin'}
              onClick={() => setActiveTab('signin')}
              className={cn(
                'flex-1 py-3 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary',
                activeTab === 'signin'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'register'}
              onClick={() => setActiveTab('register')}
              className={cn(
                'flex-1 py-3 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary',
                activeTab === 'register'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Register
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'phone'}
              onClick={() => setActiveTab('phone')}
              className={cn(
                'flex-1 py-3 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary',
                activeTab === 'phone'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Phone SMS
            </button>
          </div>

          <div className="p-6">
            {/* Sign In Tab (Email/Password) */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSignIn} noValidate>
                <div className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    leftIcon={<Mail className="h-4 w-4" />}
                    required
                  />
                  <PasswordField
                    label="Password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full mt-2"
                    isLoading={isLoading}
                  >
                    Sign In with Email
                  </Button>
                </div>
              </form>
            )}

            {/* Register Tab (Email/Password) */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} noValidate>
                <div className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    leftIcon={<Mail className="h-4 w-4" />}
                    required
                  />
                  <PasswordField
                    label="Password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <PasswordField
                    label="Confirm Password"
                    value={regConfirm}
                    onChange={(e) => {
                      setRegConfirm(e.target.value);
                      if (confirmError) setConfirmError('');
                    }}
                    autoComplete="new-password"
                    error={confirmError}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full mt-2"
                    isLoading={isLoading}
                  >
                    Create Account
                  </Button>
                </div>
              </form>
            )}

            {/* Phone Authentication Tab */}
            {activeTab === 'phone' && (
              <div>
                {!otpSent ? (
                  <form onSubmit={handleSendPhoneOtp} noValidate className="space-y-4">
                    <div>
                      <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="+1234567890 or +237690000000"
                        autoComplete="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        leftIcon={<Phone className="h-4 w-4" />}
                        required
                      />
                      <p className="text-xs text-slate-400 mt-1.5">Include country code (e.g. +1, +237)</p>
                    </div>
                    <div id="recaptcha-container" />
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full mt-2"
                      isLoading={isLoading}
                    >
                      Send Verification Code
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyPhoneOtp} noValidate className="space-y-4">
                    <div className="text-xs text-slate-400 bg-surface-hover p-3 rounded-lg border border-border">
                      Enter the 6-digit code sent to <strong className="text-slate-200">{phoneNumber}</strong>
                    </div>
                    <Input
                      label="Verification Code (OTP)"
                      type="text"
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      leftIcon={<KeyRound className="h-4 w-4" />}
                      autoComplete="one-time-code"
                      required
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={isLoading}
                    >
                      Verify & Sign In
                    </Button>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-primary hover:underline block mx-auto pt-2"
                    >
                      &larr; Change phone number
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Universal Google Sign-In divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-2 text-slate-500">or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              leftIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              Sign in with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
