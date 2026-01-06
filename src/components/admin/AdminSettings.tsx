import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Image as ImageIcon, Upload } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

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

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
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

      {/* Hero Section */}
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
    </div>
  );
}
