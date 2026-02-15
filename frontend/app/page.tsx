'use client';

import Link from 'next/link';
import { Button } from '@/components/Button';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Clawdbot</h1>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">Enterprise-Grade Authorization</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Powered by AI, designed for security. Manage permissions, authenticate users, and onboard teams with intelligence and ease.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered</h3>
            <p className="text-gray-600">Intelligent authorization that learns from your organization's patterns and adapts to threats in real-time.</p>
          </div>

          <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Enterprise Security</h3>
            <p className="text-gray-600">Bank-level encryption, multi-factor authentication, and comprehensive audit logs for compliance.</p>
          </div>

          <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Seamless Integration</h3>
            <p className="text-gray-600">Connect with your existing systems through REST APIs and webhooks for instant authorization checks.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of organizations that trust Clawdbot for secure, intelligent authorization.
          </p>
          <Link href="/auth/signup">
            <Button size="lg">Create Your Account</Button>
          </Link>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-300 py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2025 Clawdbot. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
