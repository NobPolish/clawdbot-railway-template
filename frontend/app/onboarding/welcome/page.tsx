'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export default function OnboardingWelcomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">🤖</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Clawdbot</h1>
          <p className="text-xl text-gray-600">Your AI-powered authorization and security companion</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Authorization</h3>
            <p className="text-sm text-gray-700">AI-powered permission management tailored to your needs</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-2">Seamless Onboarding</h3>
            <p className="text-sm text-gray-700">Get started in minutes with intelligent guided setup</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
            <div className="text-3xl mb-3">🛡️</div>
            <h3 className="font-semibold text-gray-900 mb-2">Enterprise Security</h3>
            <p className="text-sm text-gray-700">Bank-level security with continuous verification</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">What you'll set up today:</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <span className="text-gray-700">Complete your profile and preferences</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <span className="text-gray-700">AI-powered identity verification</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <span className="text-gray-700">Configure your authorization settings</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <span className="text-gray-700">Activate your account</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={() => router.push('/onboarding/profile')}
            className="flex-1"
          >
            Start Setup
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="flex-1"
          >
            Skip for Now
          </Button>
        </div>
      </Card>
    </main>
  );
}
