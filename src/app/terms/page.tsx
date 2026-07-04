import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions | Jobbanai",
  description: "Terms and conditions and community guidelines for Jobbanai.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
        
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-10 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Terms and Conditions & Community Guidelines</h1>
          <p className="text-[var(--muted)] mb-8">Last updated: July 2026</p>

          <div className="text-[var(--foreground)] space-y-8 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-[var(--accent)]">1. Acceptance of Terms</h2>
              <p className="text-[var(--muted)]">
                By accessing and using Jobbanai, you accept and agree to be bound by the terms and provision of this agreement. 
                In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-[var(--accent)]">2. Community Guidelines</h2>
              <p className="mb-4 text-[var(--muted)]">
                Our platform is built on trust, respect, and collaboration. We expect all users to adhere to the following guidelines:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-[var(--muted)]">
                <li><strong className="text-[var(--foreground)] font-medium">Be Respectful:</strong> Treat everyone with respect. Harassment, hate speech, bullying, or discrimination of any kind will not be tolerated.</li>
                <li><strong className="text-[var(--foreground)] font-medium">Be Authentic:</strong> Do not impersonate others or provide misleading information about yourself, your skills, or your projects.</li>
                <li><strong className="text-[var(--foreground)] font-medium">Constructive Collaboration:</strong> Engage constructively with others. Whether you are seeking a co-founder or sharing a pitch, maintain professional and supportive communication.</li>
                <li><strong className="text-[var(--foreground)] font-medium">No Spam:</strong> Do not use the platform for unauthorized advertising, spamming, or soliciting unrelated services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-[var(--accent)]">3. User Content</h2>
              <p className="text-[var(--muted)]">
                You retain ownership of any content you submit, post, or display on or through Jobbanai. 
                By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute such content.
                You are responsible for your use of the Services and for any Content you provide, including compliance with applicable laws, rules, and regulations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-[var(--accent)]">4. Account Termination</h2>
              <p className="text-[var(--muted)]">
                We reserve the right to suspend or terminate your account at any time, without notice, for conduct that we believe violates these Terms and Conditions or is harmful to other users of Jobbanai, us, or third parties, or for any other reason.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-[var(--accent)]">5. Changes to Terms</h2>
              <p className="text-[var(--muted)]">
                We reserve the right to modify these terms at any time. We do so by posting and drawing attention to the updated terms on the Site. Your decision to continue to visit and make use of the Site after such changes have been made constitutes your formal acceptance of the new Terms of Service.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
