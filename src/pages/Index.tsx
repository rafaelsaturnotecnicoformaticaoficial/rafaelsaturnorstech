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
import AdBanner from "@/components/AdBanner";
import DynamicAdBlock from "@/components/DynamicAdBlock";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <AdBanner variant="leaderboard" />
      <Services />
      <RemoteSupport />
      <DynamicAdBlock position="after-services" />
      <AdBanner variant="in-article" format="fluid" />
      <Advantages />
      <DynamicAdBlock position="after-advantages" />
      <Payment />
      <AffiliateProducts />
      <PartnersCarousel />
      <Contact />
      <AdBanner variant="leaderboard" />
      <Footer />
    </div>
  );
};

export default Index;
