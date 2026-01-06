import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

interface GTMContextType {
  gtmId: string | null;
  pushEvent: (event: string, data?: Record<string, any>) => void;
  pushEcommerce: (action: string, data: Record<string, any>) => void;
}

const GTMContext = createContext<GTMContextType>({
  gtmId: null,
  pushEvent: () => {},
  pushEcommerce: () => {},
});

export const useGTM = () => useContext(GTMContext);

interface GTMProviderProps {
  children: ReactNode;
}

export function GTMProvider({ children }: GTMProviderProps) {
  const [gtmId, setGtmId] = useState<string | null>(null);
  const location = useLocation();

  // Initialize dataLayer
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
  }, []);

  // Fetch GTM ID from settings
  useEffect(() => {
    const fetchGTMSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "gtm_settings")
          .maybeSingle();

        if (error) throw error;

        if (data?.value && typeof data.value === 'object' && !Array.isArray(data.value)) {
          const settings = data.value as Record<string, Json>;
          const id = String(settings.gtmId || "");
          const enabled = Boolean(settings.enabled);
          if (enabled && id && id.startsWith("GTM-")) {
            setGtmId(id);
          }
        }
      } catch (error) {
        console.error("Error fetching GTM settings:", error);
      }
    };

    fetchGTMSettings();
  }, []);

  // Inject GTM script when ID is available
  useEffect(() => {
    if (!gtmId) return;

    // Check if GTM is already loaded
    if (document.getElementById("gtm-script")) return;

    // GTM Head Script
    const script = document.createElement("script");
    script.id = "gtm-script";
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `;
    document.head.insertBefore(script, document.head.firstChild);

    // GTM NoScript iframe
    const noscript = document.createElement("noscript");
    noscript.id = "gtm-noscript";
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
    iframe.height = "0";
    iframe.width = "0";
    iframe.style.display = "none";
    iframe.style.visibility = "hidden";
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);

    // Push initial page view
    window.dataLayer.push({
      event: "gtm.load",
      gtmId: gtmId,
    });

  }, [gtmId]);

  // Track page views on route change
  useEffect(() => {
    if (!gtmId) return;

    window.dataLayer.push({
      event: "page_view",
      page_path: location.pathname,
      page_search: location.search,
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [location, gtmId]);

  // Push custom event to dataLayer
  const pushEvent = (event: string, data?: Record<string, any>) => {
    window.dataLayer.push({
      event,
      ...data,
    });
  };

  // Push ecommerce event to dataLayer (GA4 compatible)
  const pushEcommerce = (action: string, data: Record<string, any>) => {
    // Clear previous ecommerce data
    window.dataLayer.push({ ecommerce: null });
    
    window.dataLayer.push({
      event: action,
      ecommerce: data,
    });
  };

  return (
    <GTMContext.Provider value={{ gtmId, pushEvent, pushEcommerce }}>
      {children}
    </GTMContext.Provider>
  );
}

// Ecommerce tracking helper functions
export const trackProductView = (product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: "view_item",
    ecommerce: {
      currency: "USD",
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category || "",
        quantity: 1,
      }],
    },
  });
};

export const trackAddToCart = (product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  quantity?: number;
}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: "add_to_cart",
    ecommerce: {
      currency: "USD",
      value: product.price * (product.quantity || 1),
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category || "",
        quantity: product.quantity || 1,
      }],
    },
  });
};

export const trackBeginCheckout = (product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  coupon?: string;
}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: "begin_checkout",
    ecommerce: {
      currency: "USD",
      value: product.price,
      coupon: product.coupon || "",
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category || "",
        quantity: 1,
      }],
    },
  });
};

export const trackPurchase = (order: {
  orderId: string;
  value: number;
  product: {
    id: string;
    name: string;
    price: number;
    category?: string;
  };
  coupon?: string;
}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: "purchase",
    ecommerce: {
      transaction_id: order.orderId,
      value: order.value,
      currency: "USD",
      coupon: order.coupon || "",
      items: [{
        item_id: order.product.id,
        item_name: order.product.name,
        price: order.product.price,
        item_category: order.product.category || "",
        quantity: 1,
      }],
    },
  });
};

export const trackSearch = (searchTerm: string) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "search",
    search_term: searchTerm,
  });
};

export const trackLogin = (method: string) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "login",
    method: method,
  });
};

export const trackSignUp = (method: string) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "sign_up",
    method: method,
  });
};
