import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";

interface DynamicAdBlockProps {
  position?: string;
}

const DynamicAdBlock = ({ position = "general" }: DynamicAdBlockProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: adBlocks } = useQuery({
    queryKey: ["adsense_blocks", position],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("adsense_blocks")
        .select("*")
        .eq("active", true)
        .eq("position", position);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!containerRef.current || !adBlocks || adBlocks.length === 0) return;

    // Clear previous
    containerRef.current.innerHTML = "";

    adBlocks.forEach((block) => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = block.ad_code;

      // Execute scripts
      const scripts = wrapper.querySelectorAll("script");
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) =>
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });

      containerRef.current?.appendChild(wrapper);
    });
  }, [adBlocks]);

  if (!adBlocks || adBlocks.length === 0) return null;

  return (
    <div className="w-full py-4 flex justify-center bg-background">
      <div ref={containerRef} className="w-full max-w-4xl" />
    </div>
  );
};

export default DynamicAdBlock;
