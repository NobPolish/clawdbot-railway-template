import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary-foreground"
          >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-balance">ClawdBot</h1>
        <p className="max-w-md text-muted-foreground text-pretty">
          Configure and deploy your OpenClaw AI bot. Sign in to manage your API keys, 
          model settings, and chat platform integrations.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/auth/login">Sign In</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth/sign-up">Create Account</Link>
        </Button>
      </div>
    </main>
  )
}
