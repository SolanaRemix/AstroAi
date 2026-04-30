import { siteConfig } from "@/config/site";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
      <div className="space-y-6 text-slate-300">
        <p className="text-slate-400 text-sm">Last updated: {new Date().getFullYear()}</p>

        <h2 className="text-xl font-semibold text-white">1. Data We Collect</h2>
        <p>
          We collect your name, email, and profile image via Google Sign-In. We also collect
          data you voluntarily provide: birth dates, full names (for numerology), and palm
          images you upload.
        </p>

        <h2 className="text-xl font-semibold text-white">2. How We Use Your Data</h2>
        <p>
          Your data is used to provide personalized readings, manage subscriptions via Stripe,
          and improve the Service. We do not sell your data to third parties.
        </p>

        <h2 className="text-xl font-semibold text-white">3. Data Storage</h2>
        <p>
          Your data is stored securely in a PostgreSQL database. Palm images may be stored via
          cloud storage. We use industry-standard security practices.
        </p>

        <h2 className="text-xl font-semibold text-white">4. Third-Party Services</h2>
        <p>
          We use Google OAuth for authentication, Stripe for payments, and Vercel for hosting.
          Each has their own privacy policies.
        </p>

        <h2 className="text-xl font-semibold text-white">5. Your Rights</h2>
        <p>
          You may request deletion of your data at any time by contacting us. We will fulfill
          deletion requests within 30 days.
        </p>

        <h2 className="text-xl font-semibold text-white">6. Cookies</h2>
        <p>
          We use session cookies for authentication only. We do not use advertising or tracking
          cookies.
        </p>

        <h2 className="text-xl font-semibold text-white">7. Contact</h2>
        <p>
          For privacy questions, contact{" "}
          <a href={`mailto:${siteConfig.adminEmail}`} className="text-indigo-400 hover:underline">
            {siteConfig.adminEmail}
          </a>
        </p>
      </div>
    </div>
  );
}
