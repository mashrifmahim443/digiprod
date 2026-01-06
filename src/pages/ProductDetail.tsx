import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Lock, 
  Zap, 
  Shield, 
  CheckCircle,
  Package
} from "lucide-react";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (name, slug)
        `)
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch available keys count
  const { data: stockData } = useQuery({
    queryKey: ["product-stock", product?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("product_keys")
        .select("*", { count: "exact", head: true })
        .eq("product_id", product!.id)
        .eq("is_used", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!product?.id,
  });

  const discount = product?.original_price
    ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <Skeleton className="aspect-video w-full rounded-2xl" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center py-20">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or is no longer available.
            </p>
            <Link to="/products">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = (product.images as string[]) || [];
  const whatsIncluded = (product.whats_included as string[]) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
            <span>/</span>
            <span className="text-foreground">{product.title}</span>
          </nav>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Column - Product Info */}
            <div className="lg:col-span-3 space-y-6">
              {/* Main Image */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
                <img
                  src={images[0] || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {discount > 0 && (
                  <Badge className="absolute top-4 right-4 bg-success text-success-foreground text-base px-3 py-1">
                    Save {discount}%
                  </Badge>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors"
                    >
                      <img
                        src={img}
                        alt={`${product.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Title & Description */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {product.categories?.name && (
                    <Badge variant="secondary">{product.categories.name}</Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {product.title}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* What's Included */}
              {whatsIncluded.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">What's Included</h2>
                  <ul className="space-y-3">
                    {whatsIncluded.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column - Purchase Card (Sticky) */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-primary">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    {product.original_price && (
                      <span className="text-xl text-muted-foreground line-through">
                        ${Number(product.original_price).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <Badge className="bg-success/10 text-success border-success/20">
                      You save ${(Number(product.original_price) - Number(product.price)).toFixed(2)}
                    </Badge>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2 text-sm">
                  {stockData && stockData > 0 ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-success font-medium">
                        In Stock - {stockData} keys available
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 rounded-full bg-destructive" />
                      <span className="text-destructive font-medium">Out of Stock</span>
                    </>
                  )}
                </div>

                {/* Buy Button */}
                <Link to={`/checkout/${product.slug}`} className="block">
                  <Button 
                    className="btn-primary w-full text-lg h-14 group"
                    disabled={!stockData || stockData === 0}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Buy Now - Instant Delivery
                  </Button>
                </Link>

                {/* Trust Indicators */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4 text-primary" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 text-primary" />
                    <span>Instant Email Delivery</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Money-Back Guarantee</span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">Accepted payments:</p>
                  <div className="flex items-center gap-3">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                      alt="Visa"
                      className="h-5 opacity-50 grayscale"
                    />
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                      alt="Mastercard"
                      className="h-5 opacity-50 grayscale"
                    />
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
                      alt="Stripe"
                      className="h-5 opacity-50 grayscale"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;