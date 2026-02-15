'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export default function OnboardingCompletePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4 animate-bounce">✨</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Complete!</h1>
          <p className="text-gray-600">Your account is ready to go</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Profile completed</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Identity verified</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Account activated</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">💡 Next Steps:</span> Explore your dashboard to configure advanced security settings and manage permissions.
          </p>
        </div>

        <Button 
          onClick={() => router.push('/dashboard')}
          className="w-full"
        >
          Go to Dashboard
        </Button>
      </Card>
    </main>
  );
}
