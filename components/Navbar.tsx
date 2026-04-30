"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a1a]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {siteConfig.name}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors text-sm">
              Pricing
            </Link>
            {session?.user && (
              <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors text-sm">
                Dashboard
              </Link>
            )}
            {session?.user?.role === "ADMIN" && (
              <Link href="/admin" className="text-slate-300 hover:text-white transition-colors text-sm">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-3">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? "User"}
                    className="w-8 h-8 rounded-full border border-white/20"
                  />
                )}
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Sign out
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => signIn("google")}>
                Sign in with Google
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
