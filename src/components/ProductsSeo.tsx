import { useEffect } from "react";
import type { Tables } from "@/integrations/supabase/types";

const SITE = "https://rafaelsaturnorstech.lovable.app";

export default function ProductsSeo({ items }: { items: Tables<"catalog_items">[] }) {
  useEffect(() => {
    document.title = "Produtos e Serviços de Informática e Impressão | RS Tech São Pedro da União - MG";
    const meta = document.querySelector('meta[name="description"]');
    meta?.setAttribute("content", "Catálogo RS Tech: produtos de informática, acessórios, impressão, topo de bolo, formatação, manutenção e suporte remoto em São Pedro da União - MG.");
    const data = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Produtos e Serviços RS Tech",
      itemListElement: items.map((i, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": i.kind === "servico" ? "Service" : "Product",
          name: i.name,
          description: i.description || i.name,
          ...(i.image_url ? { image: i.image_url } : {}),
          ...(i.kind === "servico"
            ? { provider: { "@type": "LocalBusiness", name: "RS Tech" }, areaServed: "São Pedro da União - MG" }
            : { brand: { "@type": "Brand", name: "RS Tech" } }),
          url: `${SITE}/produtos`,
        },
      })),
    };
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = "products-ld";
    el.text = JSON.stringify(data);
    document.getElementById("products-ld")?.remove();
    document.head.appendChild(el);
    return () => el.remove();
  }, [items]);
  return null;
}
