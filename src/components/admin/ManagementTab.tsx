import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { brl } from '@/lib/store';
import { Download, RefreshCw } from 'lucide-react';

type Report = { orders: number; order_value_cents: number; completed_value_cents: number; appointments: number; customers: number; views: number; visitors: number; online: number; pages: {path:string;views:number}[]; statuses:{status:string;total:number}[] };
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit' }).format(new Date());

export default function ManagementTab() {
  const [to, setTo] = useState(today);
  const [from, setFrom] = useState(() => `${today().slice(0,7)}-01`);
  const [live, setLive] = useState(false);
  const qc = useQueryClient();
  const {data,error,isLoading,isFetching,refetch,dataUpdatedAt} = useQuery({queryKey:['management_report',from,to],enabled:!!from&&!!to&&from<=to,refetchInterval:15000,queryFn:async()=>{
    const {data,error} = await supabase.rpc('management_report',{_from:from,_to:to});
    if(error) throw error;
    return data as unknown as Report;
  }});
  useEffect(()=>{
    let debounce:ReturnType<typeof setTimeout> | undefined;
    const refresh = ()=> { if(debounce) clearTimeout(debounce); debounce=setTimeout(()=>{void qc.invalidateQueries({queryKey:['management_report']});},500); };
    const channel=supabase.channel(`management-${crypto.randomUUID()}`)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'page_views'},refresh)
      .on('postgres_changes',{event:'*',schema:'public',table:'site_sessions'},refresh)
      .subscribe(status=>setLive(status==='SUBSCRIBED'));
    return ()=>{if(debounce) clearTimeout(debounce);void supabase.removeChannel(channel);};
  },[qc]);
  const metrics = data ? [ ['Pedidos',data.orders],['Valor dos pedidos',brl(data.order_value_cents)],['Pedidos concluídos',brl(data.completed_value_cents)],['Agendamentos',data.appointments],['Novos clientes',data.customers],['Visualizações',data.views],['Visitantes no período',data.visitors],['No site agora',data.online] ] : [];
  const download = ()=>{
    const rows=[['Indicador','Valor'],...metrics,...(data?.pages??[]).map(p=>[p.path,p.views])];
    const csv='\uFEFF'+rows.map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(';')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`relatorio-${from}-${to}.csv`;a.click();URL.revokeObjectURL(url);
  };
  return <div className="space-y-6">
    <div className="flex flex-wrap justify-between items-center gap-3"><h2 className="text-xl font-bold">Relatório gerencial</h2><span className="text-sm text-muted-foreground">{live?'Visitas em tempo real':'Atualização automática'}{dataUpdatedAt>0&&` · ${new Date(dataUpdatedAt).toLocaleTimeString('pt-BR')}`}</span></div>
    <div className="flex flex-wrap items-end gap-3"><div><Label htmlFor="report-from">De</Label><Input id="report-from" type="date" value={from} onChange={e=>setFrom(e.target.value)}/></div><div><Label htmlFor="report-to">Até</Label><Input id="report-to" type="date" value={to} onChange={e=>setTo(e.target.value)}/></div><Button variant="outline" onClick={()=>void refetch()} disabled={isFetching||from>to}><RefreshCw size={16} className="mr-2"/>Atualizar</Button><Button variant="outline" disabled={!data} onClick={download}><Download size={16} className="mr-2"/>Exportar</Button></div>
    {from>to&&<p className="text-destructive">Selecione um período válido.</p>}{isLoading&&<p>Carregando relatório...</p>}{error&&<p className="text-destructive">Não foi possível carregar o relatório.</p>}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{metrics.map(([label,value])=><div key={label} className="p-4 border border-border rounded-lg bg-card"><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold break-words mt-2">{value}</p></div>)}</div>
    {data&&<><div><h3 className="font-bold mb-3">Pedidos por status</h3>{data.statuses.length===0?<p className="text-muted-foreground">Nenhum pedido no período.</p>:data.statuses.map(s=><div key={s.status} className="flex justify-between py-2 border-b border-border"><span>{s.status.replaceAll('_',' ')}</span><strong>{s.total}</strong></div>)}</div><div><h3 className="font-bold mb-3">Páginas visitadas</h3>{data.pages.length===0?<p className="text-muted-foreground">Nenhuma visita registrada no período.</p>:data.pages.map(p=><div key={p.path} className="flex justify-between gap-3 py-2 border-b border-border"><span className="break-all">{p.path}</span><strong>{p.views}</strong></div>)}</div></>}
  </div>;
}