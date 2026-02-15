'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';

export default function OnboardingVerificationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate sending verification code
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCodeSent(true);
      console.log('[v0] Verification code sent');
    } catch (error) {
      console.error('[v0] Send code error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1200));
      console.log('[v0] Verification successful');
      router.push('/onboarding/complete');
    } catch (error) {
      console.error('[v0] Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-1 bg-blue-600 rounded"></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span className="text-sm text-gray-600">Step 2/3</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Verification</h1>
          <p className="text-gray-600">Let's verify your identity with intelligent checks</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">🔐 Smart Verification:</span> Our AI system uses multiple verification methods to ensure security while keeping your experience smooth.
          </p>
        </div>

        {!codeSent ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <p className="text-gray-700 text-sm">We'll send a verification code to your registered email address.</p>
            <Button 
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Send Verification Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              label="Verification Code"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={isLoading}
              maxLength={6}
            />
            
            <Button 
              type="submit"
              isLoading={isLoading}
              className="w-full"
              disabled={verificationCode.length !== 6}
            >
              Verify Code
            </Button>

            <Button 
              type="button"
              variant="outline"
              onClick={() => setCodeSent(false)}
              className="w-full"
              disabled={isLoading}
            >
              Resend Code
            </Button>
          </form>
        )}
      </Card>
    </main>
  );
}
