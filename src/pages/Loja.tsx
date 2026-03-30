import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Loja = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <div className="bg-primary py-6 text-center">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
            Magazine Rafael Saturno
          </h1>
          <p className="text-primary-foreground/70 mt-1 text-sm md:text-base">
            Confira as melhores ofertas em tecnologia e eletrônicos
          </p>
        </div>
        <iframe
          src="https://www.magazinevoce.com.br/magazinerafaelsaturno/"
          title="Magazine Rafael Saturno"
          className="flex-1 w-full border-0"
          style={{ minHeight: "80vh" }}
          allow="payment"
        />
      </main>
      <Footer />
    </div>
  );
};

export default Loja;
