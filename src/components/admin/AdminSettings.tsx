import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Image as ImageIcon, Upload, CreditCard, Wallet, Gift, Mail, BarChart3 } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

interface GTMSettings {
  gtmId: string;
  enabled: boolean;
}

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
}

interface SiteInfo {
  siteName: string;
  siteLogo: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  apiKey?: string;
  secretKey?: string;
}

interface PaymentSettings {
  stripe: PaymentMethod;
  paypal: PaymentMethod;
  card: PaymentMethod;
  bkash: PaymentMethod;
}

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

interface ContactSettings {
  email: string;
  whatsapp: string;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPopupImage, setUploadingPopupImage] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const popupImageInputRef = useRef<HTMLInputElement>(null);
  
  const [heroContent, setHeroContent] = useState<HeroContent>({
    title: "",
    subtitle: "",
    description: "",
    ctaText: "",
    ctaLink: "",
    backgroundImage: "",
  });

  const [siteInfo, setSiteInfo] = useState<SiteInfo>({
    siteName: "",
    siteLogo: "",
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stripe: { id: "stripe", name: "Stripe", icon: "💳", enabled: false, apiKey: "", secretKey: "" },
    paypal: { id: "paypal", name: "PayPal", icon: "🅿️", enabled: false, apiKey: "", secretKey: "" },
    card: { id: "card", name: "Visa/Mastercard", icon: "💳", enabled: false },
    bkash: { id: "bkash", name: "bKash", icon: "📱", enabled: false, apiKey: "", secretKey: "" },
  });

  const [popupSettings, setPopupSettings] = useState<PopupSettings>({
    enabled: false,
    title: "",
    description: "",
    buttonText: "Shop Now",
    buttonLink: "/products",
    image: "",
    backgroundColor: "#7c3aed",
    discountText: "",
  });

  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    email: "support@bundlebuy.com",
    whatsapp: "+1234567890",
  });

  const [gtmSettings, setGtmSettings] = useState<GTMSettings>({
    gtmId: "",
    enabled: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");

      if (error) throw error;

      const settings: Record<string, Json> = {};
      (data || []).forEach((item) => {
        settings[item.key] = item.value;
      });

      if (settings.hero_content && typeof settings.hero_content === 'object' && !Array.isArray(settings.hero_content)) {
        const hc = settings.hero_content as Record<string, Json>;
        setHeroContent({
          title: String(hc.title || ""),
          subtitle: String(hc.subtitle || ""),
          description: String(hc.description || ""),
          ctaText: String(hc.ctaText || ""),
          ctaLink: String(hc.ctaLink || ""),
          backgroundImage: String(hc.backgroundImage || ""),
        });
      }

      if (settings.site_name && typeof settings.site_name === 'string') {
        setSiteInfo(prev => ({ ...prev, siteName: settings.site_name as string }));
      }
      if (settings.site_logo && typeof settings.site_logo === 'string') {
        setSiteInfo(prev => ({ ...prev, siteLogo: settings.site_logo as string }));
      }
      
      // Load payment settings
      if (settings.payment_methods && typeof settings.payment_methods === 'object' && !Array.isArray(settings.payment_methods)) {
        const pm = settings.payment_methods as Record<string, Json>;
        setPaymentSettings(prev => ({
          stripe: { ...prev.stripe, enabled: Boolean((pm.stripe as any)?.enabled), apiKey: String((pm.stripe as any)?.apiKey || ""), secretKey: String((pm.stripe as any)?.secretKey || "") },
          paypal: { ...prev.paypal, enabled: Boolean((pm.paypal as any)?.enabled), apiKey: String((pm.paypal as any)?.apiKey || ""), secretKey: String((pm.paypal as any)?.secretKey || "") },
          card: { ...prev.card, enabled: Boolean((pm.card as any)?.enabled) },
          bkash: { ...prev.bkash, enabled: Boolean((pm.bkash as any)?.enabled), apiKey: String((pm.bkash as any)?.apiKey || ""), secretKey: String((pm.bkash as any)?.secretKey || "") },
        }));
      }

      // Load popup settings
      if (settings.offer_popup && typeof settings.offer_popup === 'object' && !Array.isArray(settings.offer_popup)) {
        const popup = settings.offer_popup as Record<string, Json>;
        setPopupSettings({
          enabled: Boolean(popup.enabled),
          title: String(popup.title || ""),
          description: String(popup.description || ""),
          buttonText: String(popup.buttonText || "Shop Now"),
          buttonLink: String(popup.buttonLink || "/products"),
          image: String(popup.image || ""),
          backgroundColor: String(popup.backgroundColor || "#7c3aed"),
          discountText: String(popup.discountText || ""),
        });
      }

      // Load contact settings
      if (settings.contact_info && typeof settings.contact_info === 'object' && !Array.isArray(settings.contact_info)) {
        const contact = settings.contact_info as Record<string, Json>;
        setContactSettings({
          email: String(contact.email || "support@bundlebuy.com"),
          whatsapp: String(contact.whatsapp || "+1234567890"),
        });
      }

      // Load GTM settings
      if (settings.gtm_settings && typeof settings.gtm_settings === 'object' && !Array.isArray(settings.gtm_settings)) {
        const gtm = settings.gtm_settings as Record<string, Json>;
        setGtmSettings({
          gtmId: String(gtm.gtmId || ""),
          enabled: Boolean(gtm.enabled),
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveHeroContent = async () => {
    setSaving(true);
    try {
      const heroValue: Json = {
        title: heroContent.title,
        subtitle: heroContent.subtitle,
        description: heroContent.description,
        ctaText: heroContent.ctaText,
        ctaLink: heroContent.ctaLink,
        backgroundImage: heroContent.backgroundImage,
      };

      const { data: existing } = await supabase
        .from("site_settings")
        .select("key")
        .eq("key", "hero_content")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value: heroValue })
          .eq("key", "hero_content");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert({ key: "hero_content", value: heroValue });
        if (error) throw error;
      }

      toast({ title: "Hero content saved successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveSiteInfo = async () => {
    setSaving(true);
    try {
      // Save site name
      const { data: existingName } = await supabase
        .from("site_settings")
        .select("key")
        .eq("key", "site_name")
        .maybeSingle();

      if (existingName) {
        await supabase.from("site_settings").update({ value: siteInfo.siteName }).eq("key", "site_name");
      } else {
        await supabase.from("site_settings").insert({ key: "site_name", value: siteInfo.siteName });
      }

      // Save site logo
      const { data: existingLogo } = await supabase
        .from("site_settings")
        .select("key")
        .eq("key", "site_logo")
        .maybeSingle();

      if (existingLogo) {
        await supabase.from("site_settings").update({ value: siteInfo.siteLogo }).eq("key", "site_logo");
      } else {
        await supabase.from("site_settings").insert({ key: "site_logo", value: siteInfo.siteLogo });
      }

      toast({ title: "Site info saved successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const savePaymentSettings = async () => {
    setSaving(true);
    try {
      const paymentValue: Json = {
        stripe: {
          enabled: paymentSettings.stripe.enabled,
          apiKey: paymentSettings.stripe.apiKey,
          secretKey: paymentSettings.stripe.secretKey,
        },
        paypal: {
          enabled: paymentSettings.paypal.enabled,
          apiKey: paymentSettings.paypal.apiKey,
          secretKey: paymentSettings.paypal.secretKey,
        },
        card: {
          enabled: paymentSettings.card.enabled,
        },
        bkash: {
          enabled: paymentSettings.bkash.enabled,
          apiKey: paymentSettings.bkash.apiKey,
          secretKey: paymentSettings.bkash.secretKey,
        },
      };

      const { data: existing } = await supabase
        .from("site_settings")
        .select("key")
        .eq("key", "payment_methods")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value: paymentValue })
          .eq("key", "payment_methods");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert({ key: "payment_methods", value: paymentValue });
        if (error) throw error;
      }

      toast({ title: "Payment settings saved successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const savePopupSettings = async () => {
    setSaving(true);
    try {
      const popupValue: Json = {
        enabled: popupSettings.enabled,
        title: popupSettings.title,
        description: popupSettings.description,
        buttonText: popupSettings.buttonText,
        buttonLink: popupSettings.buttonLink,
        image: popupSettings.image,
        backgroundColor: popupSettings.backgroundColor,
        discountText: popupSettings.discountText,
      };

      const { data: existing } = await supabase
        .from("site_settings")
        .select("key")
        .eq("key", "offer_popup")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value: popupValue })
          .eq("key", "offer_popup");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert({ key: "offer_popup", value: popupValue });
        if (error) throw error;
      }

      toast({ title: "Popup settings saved successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveContactSettings = async () => {
    setSaving(true);
    try {
      const contactValue: Json = {
        email: contactSettings.email,
        whatsapp: contactSettings.whatsapp,
      };

      const { data: existing } = await supabase
        .from("site_settings")
        .select("key")
        .eq("key", "contact_info")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value: contactValue })
          .eq("key", "contact_info");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert({ key: "contact_info", value: contactValue });
        if (error) throw error;
      }

      toast({ title: "Contact info saved successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveGTMSettings = async () => {
    setSaving(true);
    try {
      const gtmValue: Json = {
        gtmId: gtmSettings.gtmId,
        enabled: gtmSettings.enabled,
      };

      const { data: existing } = await supabase
        .from("site_settings")
        .select("key")
        .eq("key", "gtm_settings")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value: gtmValue })
          .eq("key", "gtm_settings");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert({ key: "gtm_settings", value: gtmValue });
        if (error) throw error;
      }

      toast({ title: "GTM settings saved! Refresh the page to apply changes." });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      setSiteInfo((prev) => ({ ...prev, siteLogo: urlData.publicUrl }));
      toast({ title: "Logo uploaded successfully" });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handlePopupImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPopupImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `popup-${Date.now()}.${fileExt}`;
      const filePath = `popups/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      setPopupSettings((prev) => ({ ...prev, image: urlData.publicUrl }));
      toast({ title: "Popup image uploaded successfully" });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingPopupImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Site Settings</h2>

      {/* Site Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Site Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input
                value={siteInfo.siteName}
                onChange={(e) => setSiteInfo(prev => ({ ...prev, siteName: e.target.value }))}
                placeholder="My Store"
              />
            </div>
            <div className="space-y-2">
              <Label>Site Logo</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Recommended size: 200x60px (PNG or SVG, max 2MB)
              </p>
              <div 
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => logoInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png,image/svg+xml,image/jpeg,image/webp"
                  className="hidden"
                />
                {siteInfo.siteLogo ? (
                  <div className="space-y-3">
                    <img
                      src={siteInfo.siteLogo}
                      alt="Logo preview"
                      className="max-h-16 mx-auto object-contain"
                    />
                    <p className="text-sm text-muted-foreground">Click to change logo</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {uploadingLogo ? (
                      <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                    ) : (
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {uploadingLogo ? "Uploading..." : "Click to upload logo"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button onClick={saveSiteInfo} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Site Info
          </Button>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input
                value={contactSettings.email}
                onChange={(e) => setContactSettings(prev => ({ ...prev, email: e.target.value }))}
                placeholder="support@example.com"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp Number</Label>
              <Input
                value={contactSettings.whatsapp}
                onChange={(e) => setContactSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="+1234567890"
              />
              <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US)</p>
            </div>
          </div>
          <Button onClick={saveContactSettings} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Contact Info
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Hero Section
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={heroContent.title}
                onChange={(e) => setHeroContent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Welcome to Our Store"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={heroContent.subtitle}
                onChange={(e) => setHeroContent(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Best deals on digital products"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={heroContent.description}
              onChange={(e) => setHeroContent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Discover amazing products at unbeatable prices..."
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CTA Button Text</Label>
              <Input
                value={heroContent.ctaText}
                onChange={(e) => setHeroContent(prev => ({ ...prev, ctaText: e.target.value }))}
                placeholder="Shop Now"
              />
            </div>
            <div className="space-y-2">
              <Label>CTA Button Link</Label>
              <Input
                value={heroContent.ctaLink}
                onChange={(e) => setHeroContent(prev => ({ ...prev, ctaLink: e.target.value }))}
                placeholder="/products"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Background Image URL</Label>
            <Input
              value={heroContent.backgroundImage}
              onChange={(e) => setHeroContent(prev => ({ ...prev, backgroundImage: e.target.value }))}
              placeholder="https://example.com/hero-bg.jpg"
            />
            {heroContent.backgroundImage && (
              <div className="mt-2 rounded-lg overflow-hidden border h-32">
                <img 
                  src={heroContent.backgroundImage} 
                  alt="Hero preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <Button onClick={saveHeroContent} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Hero Content
          </Button>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stripe */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#635BFF] rounded-lg flex items-center justify-center text-white font-bold">S</div>
                <div>
                  <h4 className="font-medium">Stripe</h4>
                  <p className="text-xs text-muted-foreground">Accept credit cards globally</p>
                </div>
              </div>
              <Switch
                checked={paymentSettings.stripe.enabled}
                onCheckedChange={(checked) => setPaymentSettings(prev => ({
                  ...prev,
                  stripe: { ...prev.stripe, enabled: checked }
                }))}
              />
            </div>
            {paymentSettings.stripe.enabled && (
              <div className="grid md:grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-2">
                  <Label>Publishable Key</Label>
                  <Input
                    type="password"
                    value={paymentSettings.stripe.apiKey}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      stripe: { ...prev.stripe, apiKey: e.target.value }
                    }))}
                    placeholder="pk_live_..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secret Key</Label>
                  <Input
                    type="password"
                    value={paymentSettings.stripe.secretKey}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      stripe: { ...prev.stripe, secretKey: e.target.value }
                    }))}
                    placeholder="sk_live_..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* PayPal */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#003087] rounded-lg flex items-center justify-center text-white font-bold">P</div>
                <div>
                  <h4 className="font-medium">PayPal</h4>
                  <p className="text-xs text-muted-foreground">Accept PayPal payments</p>
                </div>
              </div>
              <Switch
                checked={paymentSettings.paypal.enabled}
                onCheckedChange={(checked) => setPaymentSettings(prev => ({
                  ...prev,
                  paypal: { ...prev.paypal, enabled: checked }
                }))}
              />
            </div>
            {paymentSettings.paypal.enabled && (
              <div className="grid md:grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input
                    type="password"
                    value={paymentSettings.paypal.apiKey}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      paypal: { ...prev.paypal, apiKey: e.target.value }
                    }))}
                    placeholder="Client ID..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secret</Label>
                  <Input
                    type="password"
                    value={paymentSettings.paypal.secretKey}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      paypal: { ...prev.paypal, secretKey: e.target.value }
                    }))}
                    placeholder="Secret..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Visa/Mastercard */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#1A1F71] to-[#F79E1B] rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Visa / Mastercard</h4>
                  <p className="text-xs text-muted-foreground">Direct card payments (via Stripe)</p>
                </div>
              </div>
              <Switch
                checked={paymentSettings.card.enabled}
                onCheckedChange={(checked) => setPaymentSettings(prev => ({
                  ...prev,
                  card: { ...prev.card, enabled: checked }
                }))}
              />
            </div>
          </div>

          {/* bKash */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E2136E] rounded-lg flex items-center justify-center text-white font-bold text-xs">bKash</div>
                <div>
                  <h4 className="font-medium">bKash</h4>
                  <p className="text-xs text-muted-foreground">Mobile payment for Bangladesh</p>
                </div>
              </div>
              <Switch
                checked={paymentSettings.bkash.enabled}
                onCheckedChange={(checked) => setPaymentSettings(prev => ({
                  ...prev,
                  bkash: { ...prev.bkash, enabled: checked }
                }))}
              />
            </div>
            {paymentSettings.bkash.enabled && (
              <div className="grid md:grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-2">
                  <Label>App Key</Label>
                  <Input
                    type="password"
                    value={paymentSettings.bkash.apiKey}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      bkash: { ...prev.bkash, apiKey: e.target.value }
                    }))}
                    placeholder="App Key..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>App Secret</Label>
                  <Input
                    type="password"
                    value={paymentSettings.bkash.secretKey}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      bkash: { ...prev.bkash, secretKey: e.target.value }
                    }))}
                    placeholder="App Secret..."
                  />
                </div>
              </div>
            )}
          </div>

          <Button onClick={savePaymentSettings} disabled={saving} className="w-full">
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Payment Settings
          </Button>
        </CardContent>
      </Card>

      {/* Offer Popup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Offer Popup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Enable Popup</h4>
              <p className="text-sm text-muted-foreground">Show offer popup to visitors</p>
            </div>
            <Switch
              checked={popupSettings.enabled}
              onCheckedChange={(checked) => setPopupSettings(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Badge Text</Label>
              <Input
                value={popupSettings.discountText}
                onChange={(e) => setPopupSettings(prev => ({ ...prev, discountText: e.target.value }))}
                placeholder="50% OFF"
              />
            </div>
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={popupSettings.backgroundColor}
                  onChange={(e) => setPopupSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={popupSettings.backgroundColor}
                  onChange={(e) => setPopupSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  placeholder="#7c3aed"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={popupSettings.title}
              onChange={(e) => setPopupSettings(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Special Offer!"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={popupSettings.description}
              onChange={(e) => setPopupSettings(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Get amazing discounts on all products..."
              rows={2}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input
                value={popupSettings.buttonText}
                onChange={(e) => setPopupSettings(prev => ({ ...prev, buttonText: e.target.value }))}
                placeholder="Shop Now"
              />
            </div>
            <div className="space-y-2">
              <Label>Button Link</Label>
              <Input
                value={popupSettings.buttonLink}
                onChange={(e) => setPopupSettings(prev => ({ ...prev, buttonLink: e.target.value }))}
                placeholder="/products"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Popup Image (Optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Recommended size: 400x300px (PNG or JPG)
            </p>
            <div 
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => popupImageInputRef.current?.click()}
            >
              <input
                type="file"
                ref={popupImageInputRef}
                onChange={handlePopupImageUpload}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />
              {popupSettings.image ? (
                <div className="space-y-3">
                  <img
                    src={popupSettings.image}
                    alt="Popup preview"
                    className="max-h-32 mx-auto object-contain rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground">Click to change image</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {uploadingPopupImage ? (
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                  ) : (
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {uploadingPopupImage ? "Uploading..." : "Click to upload image"}
                  </p>
                </div>
              )}
            </div>
            {popupSettings.image && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPopupSettings(prev => ({ ...prev, image: "" }))}
                className="text-destructive hover:text-destructive"
              >
                Remove Image
              </Button>
            )}
          </div>

          {/* Preview */}
          {popupSettings.title && (
            <div 
              className="rounded-lg p-4 text-white"
              style={{ backgroundColor: popupSettings.backgroundColor }}
            >
              <p className="text-xs font-medium opacity-80 mb-1">Preview</p>
              {popupSettings.discountText && (
                <span className="inline-block bg-white/20 rounded-full px-2 py-0.5 text-xs mb-2">
                  {popupSettings.discountText}
                </span>
              )}
              <h4 className="font-bold">{popupSettings.title}</h4>
              <p className="text-sm opacity-90">{popupSettings.description}</p>
            </div>
          )}

          <Button onClick={savePopupSettings} disabled={saving} className="w-full">
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Popup Settings
          </Button>
        </CardContent>
      </Card>

      {/* Contact Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input
                type="email"
                value={contactSettings.email}
                onChange={(e) => setContactSettings(prev => ({ ...prev, email: e.target.value }))}
                placeholder="support@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp Number</Label>
              <Input
                value={contactSettings.whatsapp}
                onChange={(e) => setContactSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="+1234567890"
              />
              <p className="text-xs text-muted-foreground">Include country code (e.g., +880...)</p>
            </div>
          </div>

          <Button onClick={saveContactSettings} disabled={saving} className="w-full">
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Contact Settings
          </Button>
        </CardContent>
      </Card>

      {/* Google Tag Manager Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Google Tag Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Enable GTM</p>
              <p className="text-sm text-muted-foreground">Enable Google Tag Manager tracking</p>
            </div>
            <Switch
              checked={gtmSettings.enabled}
              onCheckedChange={(checked) => setGtmSettings(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label>GTM Container ID</Label>
            <Input
              value={gtmSettings.gtmId}
              onChange={(e) => setGtmSettings(prev => ({ ...prev, gtmId: e.target.value }))}
              placeholder="GTM-XXXXXXX"
            />
            <p className="text-xs text-muted-foreground">
              Enter your Google Tag Manager container ID (e.g., GTM-ABC123)
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
            <p className="font-medium">Data Layer Events Available:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><code className="text-xs bg-background px-1 rounded">page_view</code> - Automatic page view tracking</li>
              <li><code className="text-xs bg-background px-1 rounded">view_item</code> - Product page views</li>
              <li><code className="text-xs bg-background px-1 rounded">add_to_cart</code> - Add to cart events</li>
              <li><code className="text-xs bg-background px-1 rounded">begin_checkout</code> - Checkout initiated</li>
              <li><code className="text-xs bg-background px-1 rounded">purchase</code> - Successful purchases</li>
            </ul>
          </div>

          <Button onClick={saveGTMSettings} disabled={saving} className="w-full">
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save GTM Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
