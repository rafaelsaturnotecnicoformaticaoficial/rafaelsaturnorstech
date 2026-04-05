import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LogOut, Plus, Trash2, Handshake, ShoppingCart, Code, ArrowLeft, Heart, Upload } from "lucide-react";
import SupportersTab from "@/components/admin/SupportersTab";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";
import logo from "@/assets/logo.png";

type Partner = Tables<"partners">;
type Product = Tables<"affiliate_products">;
type AdBlock = Tables<"adsense_blocks">;

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }

      const { data: roles } = await supabase.from("user_roles").select("role").single();
      if (!roles || roles.role !== "admin") {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }
      setIsAdmin(true);
      setLoading(false);
    };
    checkAdmin();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading || !isAdmin) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-muted/50">
      <header className="bg-background border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} alt="RS Tech" className="h-8 w-8" />
            <span className="font-display font-bold text-foreground">Painel Admin</span>
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft size={16} className="mr-1" /> Voltar ao site
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut size={16} className="mr-1" /> Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="partners">
          <TabsList className="mb-6">
            <TabsTrigger value="partners" className="gap-1"><Handshake size={14} /> Parceiros</TabsTrigger>
            <TabsTrigger value="supporters" className="gap-1"><Heart size={14} /> Apoio e Social</TabsTrigger>
            <TabsTrigger value="products" className="gap-1"><ShoppingCart size={14} /> Produtos</TabsTrigger>
            <TabsTrigger value="adsense" className="gap-1"><Code size={14} /> Anúncios</TabsTrigger>
          </TabsList>

          <TabsContent value="partners"><PartnersTab /></TabsContent>
          <TabsContent value="supporters"><SupportersTab /></TabsContent>
          <TabsContent value="products"><ProductsTab /></TabsContent>
          <TabsContent value="adsense"><AdsenseTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

/* ==================== PARTNERS TAB ==================== */
const PartnersTab = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", logo_url: "", website_url: "" });

  const { data: partners } = useQuery({
    queryKey: ["admin_partners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("partners").select("*").order("sort_order");
      if (error) throw error;
      return data as Partner[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("partners").insert({
        name: form.name,
        logo_url: form.logo_url,
        website_url: form.website_url,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_partners"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      setForm({ name: "", logo_url: "", website_url: "" });
      toast.success("Parceiro adicionado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("partners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_partners"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Parceiro removido!");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("partners").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_partners"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4">Adicionar Parceiro</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do parceiro" />
          </div>
          <div>
            <Label>URL do Logo</Label>
            <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label>URL do Site</Label>
            <Input value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://..." />
          </div>
        </div>
        <Button className="mt-4" onClick={() => addMutation.mutate()} disabled={!form.name || !form.logo_url || !form.website_url}>
          <Plus size={16} className="mr-1" /> Adicionar
        </Button>
      </div>

      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4">Parceiros Cadastrados ({partners?.length || 0})</h3>
        {partners?.length === 0 && <p className="text-muted-foreground">Nenhum parceiro cadastrado.</p>}
        <div className="space-y-3">
          {partners?.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-3 border border-border rounded-lg">
              <img src={p.logo_url} alt={p.name} className="w-12 h-12 object-contain rounded" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground truncate">{p.website_url}</p>
              </div>
              <Switch checked={p.active} onCheckedChange={(active) => toggleMutation.mutate({ id: p.id, active })} />
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)}>
                <Trash2 size={16} className="text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ==================== PRODUCTS TAB ==================== */
const ProductsTab = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", image_url: "", affiliate_link: "", description: "" });

  const { data: products } = useQuery({
    queryKey: ["admin_products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("affiliate_products").select("*").order("sort_order");
      if (error) throw error;
      return data as Product[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("affiliate_products").insert({
        name: form.name,
        image_url: form.image_url,
        affiliate_link: form.affiliate_link,
        description: form.description || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_products"] });
      queryClient.invalidateQueries({ queryKey: ["affiliate_products"] });
      setForm({ name: "", image_url: "", affiliate_link: "", description: "" });
      toast.success("Produto adicionado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("affiliate_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_products"] });
      queryClient.invalidateQueries({ queryKey: ["affiliate_products"] });
      toast.success("Produto removido!");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("affiliate_products").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_products"] });
      queryClient.invalidateQueries({ queryKey: ["affiliate_products"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4">Adicionar Produto com Link de Afiliado</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nome do Produto</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do produto" />
          </div>
          <div>
            <Label>URL da Imagem</Label>
            <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label>Link de Afiliado</Label>
            <Input value={form.affiliate_link} onChange={(e) => setForm({ ...form, affiliate_link: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label>Descrição (opcional)</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Breve descrição" />
          </div>
        </div>
        <Button className="mt-4" onClick={() => addMutation.mutate()} disabled={!form.name || !form.image_url || !form.affiliate_link}>
          <Plus size={16} className="mr-1" /> Adicionar
        </Button>
      </div>

      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4">Produtos Cadastrados ({products?.length || 0})</h3>
        {products?.length === 0 && <p className="text-muted-foreground">Nenhum produto cadastrado.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {products?.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <img src={p.image_url} alt={p.name} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground truncate">{p.description}</p>
              </div>
              <Switch checked={p.active} onCheckedChange={(active) => toggleMutation.mutate({ id: p.id, active })} />
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)}>
                <Trash2 size={16} className="text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ==================== ADSENSE TAB ==================== */
const AdsenseTab = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", ad_code: "", position: "general" });

  const { data: adBlocks } = useQuery({
    queryKey: ["admin_adsense"],
    queryFn: async () => {
      const { data, error } = await supabase.from("adsense_blocks").select("*").order("created_at");
      if (error) throw error;
      return data as AdBlock[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("adsense_blocks").insert({
        name: form.name,
        ad_code: form.ad_code,
        position: form.position,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_adsense"] });
      queryClient.invalidateQueries({ queryKey: ["adsense_blocks"] });
      setForm({ name: "", ad_code: "", position: "general" });
      toast.success("Anúncio adicionado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("adsense_blocks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_adsense"] });
      queryClient.invalidateQueries({ queryKey: ["adsense_blocks"] });
      toast.success("Anúncio removido!");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("adsense_blocks").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_adsense"] });
      queryClient.invalidateQueries({ queryKey: ["adsense_blocks"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4">Adicionar Bloco de Anúncio AdSense</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nome do bloco</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Banner topo" />
          </div>
          <div>
            <Label>Posição</Label>
            <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="general, hero, footer..." />
          </div>
          <div className="md:col-span-2">
            <Label>Código HTML do AdSense</Label>
            <Textarea
              value={form.ad_code}
              onChange={(e) => setForm({ ...form, ad_code: e.target.value })}
              placeholder='Cole aqui o código HTML do anúncio...'
              rows={6}
              className="font-mono text-xs"
            />
          </div>
        </div>
        <Button className="mt-4" onClick={() => addMutation.mutate()} disabled={!form.name || !form.ad_code}>
          <Plus size={16} className="mr-1" /> Adicionar
        </Button>
      </div>

      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4">Anúncios Cadastrados ({adBlocks?.length || 0})</h3>
        {adBlocks?.length === 0 && <p className="text-muted-foreground">Nenhum anúncio cadastrado.</p>}
        <div className="space-y-3">
          {adBlocks?.map((ad) => (
            <div key={ad.id} className="p-3 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-foreground">{ad.name}</p>
                  <p className="text-xs text-muted-foreground">Posição: {ad.position}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={ad.active} onCheckedChange={(active) => toggleMutation.mutate({ id: ad.id, active })} />
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(ad.id)}>
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                </div>
              </div>
              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-20">{ad.ad_code}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
