import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Zap, Users, Award, Heart, Globe } from "lucide-react";

const About = () => {
  const stats = [
    { label: "Happy Customers", value: "10,000+" },
    { label: "Products Delivered", value: "50,000+" },
    { label: "Countries Served", value: "100+" },
    { label: "Years in Business", value: "5+" },
  ];

  const values = [
    {
      icon: Shield,
      title: "Security First",
      description: "We prioritize the security of your transactions and personal data with enterprise-grade encryption.",
    },
    {
      icon: Zap,
      title: "Instant Delivery",
      description: "Get your digital products delivered to your inbox within seconds of purchase.",
    },
    {
      icon: Users,
      title: "Customer Focused",
      description: "Our dedicated support team is available 24/7 to help you with any questions.",
    },
    {
      icon: Award,
      title: "Quality Guaranteed",
      description: "We only offer genuine, high-quality digital products from trusted sources.",
    },
    {
      icon: Heart,
      title: "Passion Driven",
      description: "We are passionate about making premium digital products accessible to everyone.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Serving customers worldwide with localized payment options and support.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="text-primary">Bundlebuy</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            We are a leading digital marketplace dedicated to providing premium software, 
            digital products, and bundles at unbeatable prices. Our mission is to make 
            high-quality digital tools accessible to everyone, everywhere.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
          <div className="prose prose-lg dark:prose-invert mx-auto text-muted-foreground">
            <p className="mb-4">
              Bundlebuy was founded with a simple idea: everyone deserves access to 
              premium digital tools without breaking the bank. We noticed that many 
              people were missing out on amazing software and digital products simply 
              because they were too expensive.
            </p>
            <p className="mb-4">
              Today, we partner with leading software companies and creators to bring 
              you exclusive bundles and deals that you will not find anywhere else. Our 
              team works tirelessly to curate the best products and ensure a seamless 
              shopping experience.
            </p>
            <p>
              We believe in transparency, quality, and customer satisfaction. Every 
              product on our platform is carefully vetted, and our customer support 
              team is always ready to help you get the most out of your purchases.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-card border-y border-border">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="p-6 rounded-2xl bg-background border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
