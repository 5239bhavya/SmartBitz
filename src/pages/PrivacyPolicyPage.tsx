import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-xl font-semibold text-foreground mb-3 pb-2 border-b border-border">{title}</h2>
    <div className="text-muted-foreground space-y-2 leading-relaxed">{children}</div>
  </section>
);

const PrivacyPolicyPage = () => {
  const effectiveDate = "March 16, 2026";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4 bg-muted/20">
        <div className="container max-w-3xl mx-auto">
          <div className="mb-10 text-center animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 gradient-text">Privacy Policy</h1>
            <p className="text-muted-foreground text-sm font-medium bg-muted/50 inline-block px-4 py-1.5 rounded-full">Effective Date: {effectiveDate}</p>
          </div>

          <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-12 shadow-lg space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              StartupDesk ("we", "us", or "our") is committed to protecting your privacy. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your information when you use
              our platform. Please read this policy carefully.
            </p>

            <Section title="1. Information We Collect">
              <p>We collect information you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Account Information:</strong> Full name, email address, and password (stored as a secure hash via Supabase Auth).</li>
                <li><strong>Profile Information:</strong> Phone number, business name, industry, business stage, and location.</li>
                <li><strong>Business Data:</strong> Business plans, marketing ad creatives, saved ideas, and progress data you create on the platform.</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, and interaction patterns (collected anonymously).</li>
              </ul>
            </Section>

            <Section title="2. How We Use Your Information">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide, maintain, and improve our services.</li>
                <li>Personalise your experience and generate AI-powered business recommendations.</li>
                <li>Send transactional emails such as account verification and password reset links.</li>
                <li>Display your ranking on the platform leaderboard (points only, not personal data).</li>
                <li>Detect and prevent fraud, abuse, and security incidents.</li>
                <li>Comply with legal obligations.</li>
              </ul>
            </Section>

            <Section title="3. Data Storage & Security">
              <p>
                Your data is stored securely in Supabase (PostgreSQL), hosted on infrastructure compliant
                with industry-standard security practices. We implement Row Level Security (RLS) to ensure
                users can only access their own data.
              </p>
              <p>
                Passwords are never stored in plaintext. They are managed entirely by Supabase Authentication,
                which uses bcrypt hashing. All communication between your browser and our servers is encrypted
                using HTTPS/TLS.
              </p>
              <p>
                API keys and server credentials are stored in environment variables and are never exposed in
                the client-side code.
              </p>
            </Section>

            <Section title="4. Third-Party Services">
              <p>We use the following third-party services which may process your data:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Supabase:</strong> Database, authentication, and file storage. (<a href="https://supabase.com/privacy" className="text-primary underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
                <li><strong>Groq AI:</strong> Powers AI business recommendations and ad generation. User prompts may be sent to Groq for processing. (<a href="https://groq.com/privacy-policy" className="text-primary underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
                <li><strong>SerpApi:</strong> Used for supplier discovery. Search queries may be sent. (<a href="https://serpapi.com/privacy" className="text-primary underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
              </ul>
              <p>We do not sell your personal data to any third parties.</p>
            </Section>

            <Section title="5. Data Retention">
              <p>
                We retain your personal data for as long as your account is active or as needed to provide
                services. If you delete your account, your personal data will be deleted from our systems
                within 30 days, except where we are required by law to retain it.
              </p>
            </Section>

            <Section title="6. Your Rights">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Access:</strong> Request a copy of your personal data we hold.</li>
                <li><strong>Correction:</strong> Update or correct inaccurate data via your Profile settings.</li>
                <li><strong>Deletion:</strong> Request deletion of your account and personal data.</li>
                <li><strong>Portability:</strong> Request an export of your data in a machine-readable format.</li>
                <li><strong>Objection:</strong> Object to processing of your personal data for direct marketing.</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at{" "}
                <a href="mailto:privacy@startupdesk.in" className="text-primary underline">
                  privacy@startupdesk.in
                </a>.
              </p>
            </Section>

            <Section title="7. Cookies">
              <p>
                We use cookies and similar technologies to maintain your authenticated session. We do not
                use third-party advertising cookies. You can configure your browser to refuse cookies, but
                this may prevent you from using some features of the platform.
              </p>
            </Section>

            <Section title="8. Children's Privacy">
              <p>
                StartupDesk is not intended for use by individuals under the age of 13. We do not knowingly
                collect personal information from children. If we become aware that a child has provided us
                with personal data, we will take steps to delete such information.
              </p>
            </Section>

            <Section title="9. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any significant
                changes by posting the new policy on this page and updating the "Effective Date" at the top.
                Continued use of the platform after changes constitutes your acceptance of the updated policy.
              </p>
            </Section>

            <Section title="10. Contact Us">
              <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email: <a href="mailto:privacy@startupdesk.in" className="text-primary underline">privacy@startupdesk.in</a></li>
                <li>Platform: StartupDesk — AI-Powered Startup Platform for Indian Entrepreneurs</li>
              </ul>
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
