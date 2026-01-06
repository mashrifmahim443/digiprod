import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MessageCircle, Clock, Loader2 } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

interface ContactInfo {
  email: string;
  whatsapp: string;
}

const Contact = () => {
  const [loading, setLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: "support@bundlebuy.com",
    whatsapp: "+1234567890",
  });

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "contact_info")
          .maybeSingle();

        if (data?.value && typeof data.value === 'object' && !Array.isArray(data.value)) {
          const info = data.value as Record<string, Json>;
          setContactInfo({
            email: String(info.email || "support@bundlebuy.com"),
            whatsapp: String(info.whatsapp || "+1234567890"),
          });
        }
      } catch (error) {
        console.error("Error fetching contact info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  const handleWhatsAppClick = () => {
    const cleanNumber = contactInfo.whatsapp.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Contact <span className="text-primary">Support</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a question or need help? Our support team is here to assist you.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Email Card */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = `mailto:${contactInfo.email}`}>
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Email Us</h3>
                  <p className="text-primary font-medium text-lg mb-1">{contactInfo.email}</p>
                  <p className="text-sm text-muted-foreground">We reply within 24 hours</p>
                </CardContent>
              </Card>

              {/* WhatsApp Card */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleWhatsAppClick}>
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">WhatsApp</h3>
                  <p className="text-green-500 font-medium text-lg mb-1">{contactInfo.whatsapp}</p>
                  <p className="text-sm text-muted-foreground">Chat with us instantly</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Response Time Info */}
          <div className="mt-12 text-center">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Average response time: <span className="font-semibold text-foreground">Under 24 hours</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
