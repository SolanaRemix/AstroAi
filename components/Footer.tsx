import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a1a] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">✨</span>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {siteConfig.name}
              </span>
            </div>
            <p className="text-slate-400 text-sm">{siteConfig.description}</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/pricing" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            <span className="ml-2 text-slate-600">
              For entertainment and personal reflection only. Not medical or financial advice.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
