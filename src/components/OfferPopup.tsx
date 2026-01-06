import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

interface PopupSettings {
  enabled: boolean;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  backgroundColor: string;
  discountText: string;
}

export default function OfferPopup() {
  const [show, setShow] = useState(false);
  const [settings, setSettings] = useState<PopupSettings | null>(null);

  useEffect(() => {
    fetchPopupSettings();
  }, []);

  const fetchPopupSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "offer_popup")
        .maybeSingle();

      if (error) throw error;

      if (data?.value && typeof data.value === "object" && !Array.isArray(data.value)) {
        const popup = data.value as Record<string, Json>;
        const popupSettings: PopupSettings = {
          enabled: Boolean(popup.enabled),
          title: String(popup.title || ""),
          description: String(popup.description || ""),
          buttonText: String(popup.buttonText || "Shop Now"),
          buttonLink: String(popup.buttonLink || "/products"),
          image: String(popup.image || ""),
          backgroundColor: String(popup.backgroundColor || "#7c3aed"),
          discountText: String(popup.discountText || ""),
        };

        setSettings(popupSettings);

        // Check if popup was already dismissed today
        const lastDismissed = localStorage.getItem("offer_popup_dismissed");
        const today = new Date().toDateString();

        if (popupSettings.enabled && lastDismissed !== today) {
          // Show popup after 2 seconds
          setTimeout(() => setShow(true), 2000);
        }
      }
    } catch (error) {
      console.error("Error fetching popup settings:", error);
    }
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem("offer_popup_dismissed", new Date().toDateString());
  };

  if (!show || !settings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
        style={{ backgroundColor: settings.backgroundColor }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          {settings.image && (
            <div className="md:w-1/2">
              <img
                src={settings.image}
                alt="Offer"
                className="w-full h-48 md:h-full object-cover"
              />
            </div>
          )}

          {/* Content Section */}
          <div className={`p-6 md:p-8 flex flex-col justify-center text-white ${settings.image ? "md:w-1/2" : "w-full"}`}>
            {settings.discountText && (
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm font-medium mb-4 w-fit">
                <Sparkles className="h-4 w-4" />
                {settings.discountText}
              </div>
            )}

            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {settings.title}
            </h2>

            <p className="text-white/90 mb-6">
              {settings.description}
            </p>

            <div className="flex gap-3">
              <Button
                asChild
                className="bg-white text-gray-900 hover:bg-white/90 font-semibold"
              >
                <a href={settings.buttonLink}>{settings.buttonText}</a>
              </Button>
              <Button
                variant="ghost"
                onClick={handleClose}
                className="text-white hover:bg-white/20"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
