import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 1, 2024</p>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Bundlebuy, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by these terms, 
                please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Digital Products</h2>
              <p className="text-muted-foreground mb-4">
                All products sold on Bundlebuy are digital products including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Software license keys</li>
                <li>Digital downloads</li>
                <li>Online course access</li>
                <li>Design templates and assets</li>
                <li>E-books and digital guides</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. No Refund Policy</h2>
              <p className="text-muted-foreground">
                Due to the digital nature of our products, all sales are final. We do not offer 
                refunds once a product has been delivered. Please review product descriptions 
                carefully before making a purchase. If you experience technical issues with a 
                product, please contact our support team for assistance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Delivery</h2>
              <p className="text-muted-foreground">
                Digital products are delivered instantly via email after successful payment. 
                You will receive your product key or download link within seconds of completing 
                your purchase. Please ensure your email address is correct during checkout.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. License Terms</h2>
              <p className="text-muted-foreground">
                Each product comes with its own license terms as specified by the original 
                publisher or creator. By purchasing a product, you agree to comply with the 
                license terms associated with that specific product. Redistribution or resale 
                of products is strictly prohibited unless explicitly allowed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Account Responsibility</h2>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account 
                information and for all activities that occur under your account. You agree 
                to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Prohibited Uses</h2>
              <p className="text-muted-foreground mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Use our service for any illegal purposes</li>
                <li>Attempt to bypass any security measures</li>
                <li>Share or distribute purchased products without authorization</li>
                <li>Use automated systems to access our service</li>
                <li>Engage in fraudulent activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Bundlebuy shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages resulting from your use of or inability 
                to use the service. Our liability is limited to the amount you paid for the 
                specific product in question.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Changes will be 
                effective immediately upon posting. Your continued use of the service after 
                changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at 
                support@bundlebuy.com.
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
