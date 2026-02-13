'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    phone: '',
    timezone: 'UTC',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('[v0] Profile saved:', formData);
      router.push('/onboarding/verification');
    } catch (error) {
      console.error('[v0] Profile save error:', error);
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
            <span className="text-sm text-gray-600">Step 1/3</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Help us personalize your Clawdbot experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Company Name"
            placeholder="Your Company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            disabled={isLoading}
          />

          <Input
            label="Your Role"
            placeholder="e.g., DevOps Engineer"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            disabled={isLoading}
          />

          <Input
            type="tel"
            label="Phone Number (Optional)"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={isLoading}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Timezone</label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option>UTC</option>
              <option>EST</option>
              <option>CST</option>
              <option>MST</option>
              <option>PST</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
              disabled={isLoading}
            >
              Back
            </Button>
            <Button 
              type="submit"
              isLoading={isLoading}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
