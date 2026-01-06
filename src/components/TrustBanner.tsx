import { Shield, Zap, Mail, RefreshCcw } from "lucide-react";

const trustItems = [
  {
    icon: Shield,
    title: "SSL Encrypted Checkout",
    description: "Your payment info is always secure",
  },
  {
    icon: Zap,
    title: "Instant Auto-Delivery",
    description: "Get your keys within seconds",
  },
  {
    icon: Mail,
    title: "Email Support 24/7",
    description: "We're here when you need us",
  },
  {
    icon: RefreshCcw,
    title: "30-Day Refund Policy",
    description: "Not satisfied? Get your money back",
  },
];

const TrustBanner = () => {
  return (
    <section className="py-16 glass-card border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <item.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm md:text-base">
                {item.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground hidden md:block">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;