import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PartnersCarousel from "@/components/PartnersCarousel";
import Services from "@/components/Services";
import Advantages from "@/components/Advantages";
import Payment from "@/components/Payment";

import AffiliateProducts from "@/components/AffiliateProducts";
import RemoteSupport from "@/components/RemoteSupport";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <RemoteSupport />
      <Advantages />
      <Payment />
      <AffiliateProducts />
      <PartnersCarousel />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
