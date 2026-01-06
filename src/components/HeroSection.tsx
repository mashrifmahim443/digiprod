import { ArrowRight, Lock, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden animated-gradient">
      {/* Floating particles effect */}
      <div className="particles-container">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/20 animate-float"
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight animate-fade-in">
            <span className="text-gradient glow-purple">Premium Digital Bundles</span>
            <br />
            <span className="text-white">at Unbeatable Prices</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Instant delivery. Secure checkout. Lifetime access to premium digital products.
          </p>

          {/* CTA Button */}
          <div className="pt-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/products">
              <Button className="btn-primary text-lg h-14 px-10 group">
                Browse Bundles
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 pt-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="trust-badge">
              <Lock className="w-4 h-4 text-primary" />
              <span>Secure Checkout</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/20" />
            <div className="trust-badge">
              <Zap className="w-4 h-4 text-primary" />
              <span>Instant Delivery</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/20" />
            <div className="trust-badge">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>1000+ Happy Customers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;