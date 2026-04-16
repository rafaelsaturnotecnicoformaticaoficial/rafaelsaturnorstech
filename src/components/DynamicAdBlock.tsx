import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface DynamicAdBlockProps {
  position?: string;
}

interface AdRow {
  id: string;
  ad_code: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

const DynamicAdBlock = ({ position = "general" }: DynamicAdBlockProps) => {
  const { data: adBlocks } = useQuery({
    queryKey: ["adsense_blocks_public", position],
    queryFn: async () => {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/get-ads?position=${encodeURIComponent(position)}`,
      );
      if (!res.ok) return [] as AdRow[];
      const json = await res.json();
      return (json.ads ?? []) as AdRow[];
    },
  });

  const srcDoc = useMemo(() => {
    if (!adBlocks || adBlocks.length === 0) return null;
    const body = adBlocks.map((b) => b.ad_code).join("\n");
    return `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>body{margin:0;font-family:system-ui,sans-serif;}</style></head><body>${body}</body></html>`;
  }, [adBlocks]);

  if (!srcDoc) return null;

  return (
    <div className="w-full py-4 flex justify-center bg-background">
      <iframe
        title="Anúncio"
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        className="w-full max-w-4xl border-0"
        style={{ minHeight: 100 }}
      />
    </div>
  );
};

export default DynamicAdBlock;
