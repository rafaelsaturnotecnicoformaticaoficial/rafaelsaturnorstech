import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PartnersCarousel from "@/components/PartnersCarousel";
import Services from "@/components/Services";
import Advantages from "@/components/Advantages";
import Payment from "@/components/Payment";
import FeaturedProducts from "@/components/FeaturedProducts";
import AffiliateProducts from "@/components/AffiliateProducts";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import DynamicAdBlock from "@/components/DynamicAdBlock";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <AdBanner />
      <Services />
      <DynamicAdBlock position="after-services" />
      <AdBanner />
      <Advantages />
      <DynamicAdBlock position="after-advantages" />
      <Payment />
      <FeaturedProducts />
      <AffiliateProducts />
      <PartnersCarousel />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
