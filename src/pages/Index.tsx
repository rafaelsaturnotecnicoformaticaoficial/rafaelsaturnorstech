import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Advantages from "@/components/Advantages";
import Payment from "@/components/Payment";
import FeaturedProducts from "@/components/FeaturedProducts";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <AdBanner />
      <Services />
      <AdBanner />
      <FeaturedProducts />
      <AdBanner />
      <Advantages />
      <AdBanner />
      <Payment />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
