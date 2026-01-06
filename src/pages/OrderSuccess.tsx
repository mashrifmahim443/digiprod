import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Copy, Mail, Home, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { key, email, productTitle } = location.state || {};

  const copyKey = () => {
    if (key) {
      navigator.clipboard.writeText(key);
      toast({
        title: "Copied!",
        description: "Product key copied to clipboard",
      });
    }
  };

  if (!key) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6 space-y-4">
            <p className="text-muted-foreground">Order information not found</p>
            <Button onClick={() => navigate("/products")}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <p className="text-muted-foreground mt-2">
            Thank you for your purchase
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Product</p>
            <p className="font-semibold">{productTitle}</p>
          </div>

          {/* Product Key */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Your Product Key</p>
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <div className="flex items-center justify-between gap-4">
                <code className="text-sm font-mono break-all flex-1">
                  {key}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyKey}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Save this key in a safe place. You can use it to activate your product.
            </p>
          </div>

          {/* Email Confirmation */}
          <div className="flex items-start gap-3 bg-muted/30 p-4 rounded-lg">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Confirmation Email Sent</p>
              <p className="text-xs text-muted-foreground">
                We've sent the product key to <span className="font-medium">{email}</span>
              </p>
            </div>
          </div>

          {/* Order ID */}
          <div className="text-center text-xs text-muted-foreground">
            Order ID: <span className="font-mono">{orderId}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              asChild
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button className="flex-1" asChild>
              <Link to="/products">
                <ShoppingBag className="h-4 w-4 mr-2" />
                More Products
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
