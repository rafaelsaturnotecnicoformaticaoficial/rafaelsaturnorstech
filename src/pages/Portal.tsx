import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Copy, LogOut, Link as LinkIcon, MousePointerClick, Users, Wallet, Award, Gift } from "lucide-react";

interface ProfileRow {
  full_name: string | null;
  email: string | null;
  whatsapp: string | null;
  city: string | null;
  is_affiliate: boolean;
  is_loyalty_member: boolean;
}
interface CodeRow { code: string; clicks: number }
interface CommissionRow {
  id: string;
  client_name: string;
  service_type: string;
  service_value: number;
  commission_value: number;
  service_status: string;
  payment_status: string;
  created_at: string;
}
interface LoyaltyRow {
  id: string;
  service_type: string;
  service_value: number;
  description: string | null;
  service_date: string;
}

const Portal = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [code, setCode] = useState<CodeRow | null>(null);
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      const uid = session.user.id;
      setUserId(uid);

      const [{ data: prof }, { data: codeRow }, { data: comm }, { data: loy }] = await Promise.all([
        supabase.from("profiles").select("full_name,email,whatsapp,city,is_affiliate,is_loyalty_member").eq("user_id", uid).maybeSingle(),
        supabase.from("affiliate_codes").select("code,clicks").eq("user_id", uid).maybeSingle(),
        supabase.from("affiliate_commissions").select("id,client_name,service_type,service_value,commission_value,service_status,payment_status,created_at").eq("affiliate_user_id", uid).order("created_at", { ascending: false }),
        supabase.from("loyalty_services").select("id,service_type,service_value,description,service_date").eq("client_user_id", uid).order("service_date", { ascending: false }),
      ]);

      setProfile(prof as ProfileRow | null);
      setCode(codeRow as CodeRow | null);
      setCommissions((comm as CommissionRow[]) || []);
      setLoyalty((loy as LoyaltyRow[]) || []);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const generateCode = async () => {
    if (!userId) return;
    const base = (profile?.full_name || "rstech").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").slice(0, 8);
    const newCode = base + Math.random().toString(36).slice(2, 6);
    const { error } = await supabase.from("affiliate_codes").insert({ user_id: userId, code: newCode });
    if (error) return toast.error(error.message);
    await supabase.from("profiles").update({ is_affiliate: true }).eq("user_id", userId);
    setCode({ code: newCode, clicks: 0 });
    toast.success("Link de indicação criado!");
  };

  const referralLink = code ? `${window.location.origin}/r/${code.code}` : "";
  const totalPending = commissions.filter((c) => c.payment_status === "pendente").reduce((s, c) => s + Number(c.commission_value), 0);
  const totalPaid = commissions.filter((c) => c.payment_status === "pago").reduce((s, c) => s + Number(c.commission_value), 0);
  const totalServices = loyalty.length;
  const nextDiscount = totalServices >= 10 ? "10% de desconto disponível" : totalServices >= 5 ? "5% de desconto disponível" : `Faltam ${5 - totalServices} serviços para 5% de desconto`;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Link copiado!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Carregando...</div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold">Olá, {profile?.full_name || "Cliente"} 👋</h1>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}><LogOut size={16} className="mr-2" />Sair</Button>
        </div>

        <Tabs defaultValue="afiliado">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="afiliado">Programa Afiliado</TabsTrigger>
            <TabsTrigger value="fidelidade">Programa Fidelidade</TabsTrigger>
          </TabsList>

          <TabsContent value="afiliado" className="space-y-6 mt-6">
            {!code ? (
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <p className="mb-4">Você ainda não tem um link de indicação. Gere o seu para começar a indicar clientes e receber comissões.</p>
                <Button onClick={generateCode}>Gerar meu link de indicação</Button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-4 gap-4">
                  <StatCard icon={<MousePointerClick />} label="Cliques no link" value={String(code.clicks)} />
                  <StatCard icon={<Users />} label="Indicações" value={String(commissions.length)} />
                  <StatCard icon={<Wallet />} label="A receber" value={`R$ ${totalPending.toFixed(2)}`} />
                  <StatCard icon={<Award />} label="Já recebido" value={`R$ ${totalPaid.toFixed(2)}`} />
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2"><LinkIcon size={16} />Seu link de indicação</p>
                  <div className="flex gap-2 flex-wrap">
                    <input readOnly value={referralLink} className="flex-1 min-w-[200px] px-3 py-2 border border-border rounded-md bg-muted text-sm" />
                    <Button onClick={copyLink}><Copy size={16} className="mr-2" />Copiar</Button>
                    <Button variant="outline" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Conheça a RS Tech! " + referralLink)}`, "_blank")}>
                      Compartilhar WhatsApp
                    </Button>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-bold mb-3">Minhas indicações</h3>
                  {commissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma indicação registrada ainda.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-left border-b">
                          <tr>
                            <th className="py-2">Cliente</th>
                            <th>Serviço</th>
                            <th>Valor</th>
                            <th>Comissão</th>
                            <th>Status</th>
                            <th>Pagamento</th>
                          </tr>
                        </thead>
                        <tbody>
                          {commissions.map((c) => (
                            <tr key={c.id} className="border-b">
                              <td className="py-2">{c.client_name}</td>
                              <td>{c.service_type}</td>
                              <td>R$ {Number(c.service_value).toFixed(2)}</td>
                              <td className="font-semibold">R$ {Number(c.commission_value).toFixed(2)}</td>
                              <td>{c.service_status}</td>
                              <td>{c.payment_status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="fidelidade" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <StatCard icon={<Gift />} label="Serviços contratados" value={String(totalServices)} />
              <StatCard icon={<Award />} label="Próximo benefício" value={nextDiscount} />
              <StatCard icon={<Wallet />} label="Total investido" value={`R$ ${loyalty.reduce((s, l) => s + Number(l.service_value), 0).toFixed(2)}`} />
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-3">Como funciona</h3>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>A cada 5 serviços: 5% de desconto no próximo</li>
                <li>A cada 10 serviços: 10% de desconto especial</li>
                <li>Clientes frequentes recebem promoções exclusivas</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-3">Meu histórico</h3>
              {loyalty.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum serviço registrado ainda. Após cada atendimento, seu serviço será adicionado aqui pela equipe RS Tech.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left border-b">
                      <tr><th className="py-2">Data</th><th>Serviço</th><th>Descrição</th><th>Valor</th></tr>
                    </thead>
                    <tbody>
                      {loyalty.map((l) => (
                        <tr key={l.id} className="border-b">
                          <td className="py-2">{new Date(l.service_date).toLocaleDateString("pt-BR")}</td>
                          <td>{l.service_type}</td>
                          <td>{l.description || "-"}</td>
                          <td>R$ {Number(l.service_value).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-card border border-border rounded-xl p-4">
    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">{icon}<span>{label}</span></div>
    <div className="font-bold text-lg">{value}</div>
  </div>
);

export default Portal;
