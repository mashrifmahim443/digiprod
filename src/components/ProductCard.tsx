import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category?: string;
}

const ProductCard = ({
  id,
  title,
  slug,
  shortDescription,
  price,
  originalPrice,
  images,
  category,
}: ProductCardProps) => {
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Card className="group hover-lift overflow-hidden border-border/50 bg-card">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={images[0] || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {discount > 0 && (
            <Badge className="absolute top-3 right-3 bg-success text-success-foreground font-semibold">
              Save {discount}%
            </Badge>
          )}
          {category && (
            <Badge variant="secondary" className="absolute top-3 left-3">
              {category}
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6 space-y-4">
          <h3 className="font-semibold text-lg line-clamp-2 text-card-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {shortDescription}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              ${price.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* CTA Button */}
          <Link to={`/product/${slug}`} className="block">
            <Button
              variant="outline"
              className="w-full group/btn border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all"
            >
              View Bundle
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;