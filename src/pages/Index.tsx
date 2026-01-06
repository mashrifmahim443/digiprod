import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import TrustBanner from "@/components/TrustBanner";
import Footer from "@/components/Footer";
import OfferPopup from "@/components/OfferPopup";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <FeaturedProducts />
        <TrustBanner />
      </main>
      <Footer />
      <OfferPopup />
    </div>
  );
};

export default Index;