import { siteConfig } from "@/config/site";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
      <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300">
        <p className="text-slate-400 text-sm">Last updated: {new Date().getFullYear()}</p>

        <h2 className="text-xl font-semibold text-white">1. Acceptance</h2>
        <p>
          By using {siteConfig.name} (&ldquo;the Service&rdquo;), you agree to these Terms. If you do not
          agree, please do not use the Service.
        </p>

        <h2 className="text-xl font-semibold text-white">2. Nature of Service</h2>
        <p>
          {siteConfig.name} provides numerology profiles, symbolic palm readings, and oracle
          guidance for personal reflection and entertainment purposes only. All content is
          symbolic and should not be taken as medical, psychological, financial, or legal advice.
          We make no guarantees about accuracy or outcomes.
        </p>

        <h2 className="text-xl font-semibold text-white">3. Subscriptions & Payments</h2>
        <p>
          Subscriptions are billed via Stripe. You may cancel at any time through your
          dashboard. Refunds are at our discretion. Prices may change with notice.
        </p>

        <h2 className="text-xl font-semibold text-white">4. User Accounts</h2>
        <p>
          You are responsible for maintaining the security of your account. You must be at least
          18 years old to use the Service. We reserve the right to terminate accounts that
          violate these Terms.
        </p>

        <h2 className="text-xl font-semibold text-white">5. Intellectual Property</h2>
        <p>
          All content, designs, and code on the Service are owned by {siteConfig.name} unless
          otherwise noted. You may not reproduce or redistribute content without permission.
        </p>

        <h2 className="text-xl font-semibold text-white">6. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, {siteConfig.name} is not liable for any
          indirect, incidental, or consequential damages arising from use of the Service.
        </p>

        <h2 className="text-xl font-semibold text-white">7. Contact</h2>
        <p>
          Questions? Contact us at{" "}
          <a href={`mailto:${siteConfig.adminEmail}`} className="text-indigo-400 hover:underline">
            {siteConfig.adminEmail}
          </a>
        </p>
      </div>
    </div>
  );
}
