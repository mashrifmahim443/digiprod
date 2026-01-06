import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 1, 2024</p>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground">
                At Bundlebuy, we take your privacy seriously. This Privacy Policy explains how 
                we collect, use, disclose, and safeguard your information when you visit our 
                website and use our services. Please read this privacy policy carefully.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">
                We may collect information about you in a variety of ways:
              </p>
              <h3 className="text-xl font-medium mb-2">Personal Data</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Name and email address</li>
                <li>Billing and payment information</li>
                <li>Purchase history</li>
                <li>Communication preferences</li>
              </ul>
              <h3 className="text-xl font-medium mb-2">Automatically Collected Data</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>IP address and browser type</li>
                <li>Device information</li>
                <li>Pages visited and time spent</li>
                <li>Referring website addresses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Send you order confirmations and product keys</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Improve our website and services</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Prevent fraudulent transactions</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
              <p className="text-muted-foreground mb-4">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Payment processors to complete transactions</li>
                <li>Email service providers for order communications</li>
                <li>Analytics providers to improve our services</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational security measures to 
                protect your personal information. This includes SSL encryption for all 
                data transmission, secure payment processing through trusted providers, 
                and regular security audits. However, no method of transmission over the 
                Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
              <p className="text-muted-foreground">
                We use cookies and similar tracking technologies to enhance your browsing 
                experience, analyze site traffic, and personalize content. You can control 
                cookie preferences through your browser settings. Essential cookies are 
                required for the website to function properly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Third-Party Links</h2>
              <p className="text-muted-foreground">
                Our website may contain links to third-party websites. We are not responsible 
                for the privacy practices of these external sites. We encourage you to review 
                their privacy policies before providing any personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your personal information for as long as necessary to fulfill the 
                purposes for which it was collected, including to satisfy legal, accounting, 
                or reporting requirements. Order history is retained for customer service 
                and legal compliance purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of 
                any changes by posting the new policy on this page and updating the date at 
                the top. Your continued use of our services after changes constitutes 
                acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy or wish to exercise your 
                data rights, please contact us at privacy@bundlebuy.com.
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;
