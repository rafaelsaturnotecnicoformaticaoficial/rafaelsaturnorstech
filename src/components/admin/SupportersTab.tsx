import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Upload, Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

type Supporter = Tables<"supporters">;

const SupportersTab = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", logo_url: "", website_url: "" });
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<Supporter | null>(null);
  const [editForm, setEditForm] = useState({ name: "", logo_url: "", website_url: "" });
  const [editUploading, setEditUploading] = useState(false);

  const { data: supporters } = useQuery({
    queryKey: ["admin_supporters"],
    queryFn: async () => {
      const { data, error } = await supabase.from("supporters").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const setUpload = isEdit ? setEditUploading : setUploading;
    setUpload(true);
    const ext = file.name.split(".").pop();
    const path = `supporters/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("banners").upload(path, file);
    if (error) { toast.error("Erro ao enviar imagem"); setUpload(false); return; }
    const { data: urlData } = supabase.storage.from("banners").getPublicUrl(path);
    if (isEdit) setEditForm((f) => ({ ...f, logo_url: urlData.publicUrl }));
    else setForm((f) => ({ ...f, logo_url: urlData.publicUrl }));
    setUpload(false);
    toast.success("Imagem enviada!");
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("supporters").insert({ name: form.name, logo_url: form.logo_url, website_url: form.website_url || "" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_supporters"] });
      queryClient.invalidateQueries({ queryKey: ["supporters"] });
      setForm({ name: "", logo_url: "", website_url: "" });
      toast.success("Apoiador adicionado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("supporters").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_supporters"] });
      queryClient.invalidateQueries({ queryKey: ["supporters"] });
      toast.success("Apoiador removido!");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("supporters").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_supporters"] });
      queryClient.invalidateQueries({ queryKey: ["supporters"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const { error } = await supabase.from("supporters").update({ name: editForm.name, logo_url: editForm.logo_url, website_url: editForm.website_url }).eq("id", editing.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_supporters"] });
      queryClient.invalidateQueries({ queryKey: ["supporters"] });
      setEditing(null);
      toast.success("Apoiador atualizado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (s: Supporter) => {
    setEditing(s);
    setEditForm({ name: s.name, logo_url: s.logo_url, website_url: s.website_url });
  };

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4">Adicionar Apoio e Social</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do apoiador" />
          </div>
          <div>
            <Label>URL da Imagem (ou envie abaixo)</Label>
            <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
            <div className="mt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
                <Upload size={14} />
                {uploading ? "Enviando..." : "Enviar foto"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e)} disabled={uploading} />
              </label>
            </div>
          </div>
          <div>
            <Label>URL do Site (opcional)</Label>
            <Input value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://..." />
          </div>
        </div>
        <Button className="mt-4" onClick={() => addMutation.mutate()} disabled={!form.name || !form.logo_url}>
          <Plus size={16} className="mr-1" /> Adicionar
        </Button>
      </div>

      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4">Apoiadores Cadastrados ({supporters?.length || 0})</h3>
        {supporters?.length === 0 && <p className="text-muted-foreground">Nenhum apoiador cadastrado.</p>}
        <div className="space-y-3">
          {supporters?.map((s) => (
            <div key={s.id} className="flex items-center gap-4 p-3 border border-border rounded-lg">
              <img src={s.logo_url} alt={s.name} className="w-12 h-12 object-contain rounded" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground truncate">{s.website_url || "Sem link"}</p>
              </div>
              <Switch checked={s.active} onCheckedChange={(active) => toggleMutation.mutate({ id: s.id, active })} />
              <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                <Pencil size={16} className="text-primary" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(s.id)}>
                <Trash2 size={16} className="text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Apoiador</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome</Label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
            <div>
              <Label>URL da Imagem</Label>
              <Input value={editForm.logo_url} onChange={(e) => setEditForm({ ...editForm, logo_url: e.target.value })} />
              <div className="mt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
                  <Upload size={14} /> {editUploading ? "Enviando..." : "Enviar nova foto"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, true)} disabled={editUploading} />
                </label>
              </div>
              {editForm.logo_url && <img src={editForm.logo_url} alt="Preview" className="w-16 h-16 object-contain rounded mt-2" />}
            </div>
            <div><Label>URL do Site</Label><Input value={editForm.website_url} onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })} /></div>
            <Button onClick={() => updateMutation.mutate()} disabled={!editForm.name || !editForm.logo_url}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportersTab;
