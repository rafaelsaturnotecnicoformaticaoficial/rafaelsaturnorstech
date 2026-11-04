import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreNav from "@/components/store/StoreNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { brl, orderNumber, ORDER_STATUS, APPT_STATUS } from "@/lib/store";

type P = { full_name: string; whatsapp: string; address: string; city: string; state: string };

const MinhaConta = () => {
  const nav = useNavigate();
  const [uid, setUid] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [appts, setAppts] = useState<any[]>([]);
  const [p, setP] = useState<P>({ full_name: "", whatsapp: "", address: "", city: "", state: "" });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return nav("/entrar?next=/minha-conta");
      const id = data.user.id;
      setUid(id);
      const [o, a, pr] = await Promise.all([
        supabase.from("orders").select("id,number,status,subtotal_cents,created_at").eq("user_id", id).order("created_at", { ascending: false }),
        supabase.from("appointments").select("id,service_name,slot_date,slot_time,status").eq("user_id", id).order("slot_date", { ascending: false }),
        supabase.from("profiles").select("full_name,whatsapp,address,city,state").eq("user_id", id).maybeSingle(),
      ]);
      setOrders(o.data || []);
      setAppts(a.data || []);
      if (pr.data) setP({ full_name: pr.data.full_name || "", whatsapp: pr.data.whatsapp || "", address: (pr.data as any).address || "", city: pr.data.city || "", state: pr.data.state || "" });
    });
  }, [nav]);

  const save = async () => {
    if (!uid) return;
    const { error } = await supabase.from("profiles").update(p as any).eq("user_id", uid);
    error ? toast.error("Não foi possível salvar.") : toast.success("Dados salvos.");
  };
  const logout = async () => { await supabase.auth.signOut(); nav("/"); };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <StoreNav />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Minha Conta</h1>
          <Button variant="outline" onClick={logout}>Sair</Button>
        </div>
        <Tabs defaultValue="pedidos">
          <TabsList>
            <TabsTrigger value="pedidos">Meus Pedidos</TabsTrigger>
            <TabsTrigger value="agendamentos">Meus Agendamentos</TabsTrigger>
            <TabsTrigger value="dados">Meus Dados</TabsTrigger>
          </TabsList>
          <TabsContent value="pedidos" className="space-y-2">
            {orders.length === 0 && <p className="text-muted-foreground">Nenhum pedido ainda.</p>}
            {orders.map((o) => (
              <div key={o.id} className="border rounded-lg p-3 flex justify-between">
                <div><b>{orderNumber(o.number)}</b> · {new Date(o.created_at).toLocaleDateString("pt-BR")}</div>
                <div className="text-right"><div>{brl(o.subtotal_cents)}</div><div className="text-sm text-muted-foreground">{ORDER_STATUS[o.status] || o.status}</div></div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="agendamentos" className="space-y-2">
            {appts.length === 0 && <p className="text-muted-foreground">Nenhum agendamento ainda.</p>}
            {appts.map((a) => (
              <div key={a.id} className="border rounded-lg p-3 flex justify-between">
                <div><b>{a.service_name}</b><div className="text-sm">{a.slot_date.split("-").reverse().join("/")} às {a.slot_time}</div></div>
                <div className="text-sm text-muted-foreground">{APPT_STATUS[a.status] || a.status}</div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="dados" className="space-y-3">
            {(["full_name", "whatsapp", "address", "city", "state"] as const).map((k) => (
              <div key={k}>
                <label className="text-sm font-bold">{{ full_name: "Nome completo", whatsapp: "WhatsApp", address: "Endereço", city: "Cidade", state: "Estado" }[k]}</label>
                <Input value={p[k]} onChange={(e) => setP({ ...p, [k]: e.target.value })} />
              </div>
            ))}
            <Button onClick={save}>Salvar</Button>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};
export default MinhaConta;
