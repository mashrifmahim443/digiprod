import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, CreditCard, Shield, Loader2, Phone, MapPin, Ticket, Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { trackBeginCheckout, trackPurchase } from "@/components/GTMProvider";

interface Product {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  images: string[];
  short_description: string | null;
}

interface CouponData {
  valid: boolean;
  coupon_id?: string;
  code?: string;
  discount_type?: string;
  discount_value?: number;
  discount_amount?: number;
  final_amount?: number;
  error?: string;
}

export default function Checkout() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'email' | 'payment'>('email');
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [processing, setProcessing] = useState(false);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  // Track begin_checkout when product is loaded
  useEffect(() => {
    if (product) {
      trackBeginCheckout({
        id: product.id,
        name: product.title,
        price: product.price,
        coupon: appliedCoupon?.code,
      });
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, price, original_price, images, short_description")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      
      const images = Array.isArray(data.images) 
        ? data.images.map(img => String(img))
        : [];
      
      setProduct({ ...data, images });
    } catch (error) {
      console.error("Error fetching product:", error);
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim() || !product) return;
    
    setValidatingCoupon(true);
    try {
      const { data, error } = await supabase.rpc('validate_coupon', {
        p_code: couponCode.trim(),
        p_order_amount: product.price
      });
      
      if (error) throw error;
      
      const result = data as unknown as CouponData;
      
      if (result.valid) {
        setAppliedCoupon(result);
        toast({
          title: "Coupon applied!",
          description: `You saved $${result.discount_amount?.toFixed(2)}`,
        });
      } else {
        toast({
          title: "Invalid coupon",
          description: result.error || "This coupon cannot be applied",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !phone || !address) {
      toast({
        title: "Required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    setStep('payment');
  };

  const getFinalPrice = () => {
    if (!product) return 0;
    return appliedCoupon?.final_amount ?? product.price;
  };

  const handlePayment = async () => {
    if (!product) return;

    setProcessing(true);
    
    try {
      // If coupon applied, increment usage
      if (appliedCoupon?.coupon_id) {
        await supabase.rpc('use_coupon', { p_coupon_id: appliedCoupon.coupon_id });
      }
      
      // Call edge function for payment processing
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          productId: product.id,
          customerEmail: email,
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
          couponCode: appliedCoupon?.code || null,
          discountAmount: appliedCoupon?.discount_amount || 0,
        }
      });

      if (error) throw error;

      const result = data as { success: boolean; order_id?: string; key?: string; error?: string };
      
      if (result.success) {
        // Track purchase event in GTM
        trackPurchase({
          orderId: result.order_id || "",
          value: getFinalPrice(),
          product: {
            id: product.id,
            name: product.title,
            price: product.price,
          },
          coupon: appliedCoupon?.code,
        });

        navigate(`/order-success/${result.order_id}`, {
          state: { key: result.key, email, productTitle: product.title }
        });
      } else {
        throw new Error(result.error || 'Order processing failed');
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                {product.images[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{product.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.short_description}
                  </p>
                </div>
              </div>
              
              {/* Coupon Code Input */}
              <div className="border-t pt-4">
                <Label className="text-sm font-medium mb-2 block">Have a coupon?</Label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{appliedCoupon.code}</span>
                      <span className="text-xs text-green-600">
                        ({appliedCoupon.discount_type === 'percentage' 
                          ? `${appliedCoupon.discount_value}% off` 
                          : `$${appliedCoupon.discount_value} off`})
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeCoupon}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="uppercase"
                    />
                    <Button 
                      variant="outline" 
                      onClick={applyCoupon}
                      disabled={validatingCoupon || !couponCode.trim()}
                    >
                      {validatingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${product.price.toFixed(2)}</span>
                </div>
                {product.original_price && product.original_price > product.price && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Product Discount</span>
                    <span className="text-green-500">
                      -${(product.original_price - product.price).toFixed(2)}
                    </span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Coupon ({appliedCoupon.code})</span>
                    <span className="text-green-500">
                      -${appliedCoupon.discount_amount?.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-primary">${getFinalPrice().toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <Shield className="h-4 w-4" />
                <span>Secure checkout. Instant delivery.</span>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  ⚠️ No Refund Policy: All sales are final. Please review your order carefully before completing the purchase.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${step === 'email' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'email' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <Mail className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Details</span>
              </div>
              <div className="flex-1 h-px bg-border" />
              <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <CreditCard className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Payment</span>
              </div>
            </div>

            {step === 'email' ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Your product key will be sent to this email
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+880 1XXX-XXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your full address..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Continue to Payment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Customer</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Email</span>
                      <span className="font-medium">{email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Phone</span>
                      <span className="font-medium">{phone}</span>
                    </div>
                    <div className="text-sm">
                      <span className="block mb-1">Address</span>
                      <span className="font-medium text-xs">{address}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep('email')}
                      disabled={processing}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handlePayment}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Pay ${getFinalPrice().toFixed(2)}</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
