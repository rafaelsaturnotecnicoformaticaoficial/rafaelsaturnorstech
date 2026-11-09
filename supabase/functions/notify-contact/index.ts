import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'npm:zod@3'

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_mail/gmail/v1'
const TO = 'rafaelsaturnotecnicoformatica@gmail.com'
const b64 = (s: string) => btoa(Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join(''))
const hdr = (v: string) => (/^[\x00-\x7F]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=`)
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const p = z.object({ id: z.string().uuid() }).safeParse(await req.json())
    if (!p.success) return json({ error: 'id inválido' }, 400)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY'), KEY = Deno.env.get('GOOGLE_MAIL_API_KEY')
    if (!LOVABLE_API_KEY || !KEY) return json({ error: 'Gmail não configurado' }, 500)
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: m } = await db.from('contact_messages').select('*').eq('id', p.data.id).maybeSingle()
    if (!m) return json({ error: 'não encontrada' }, 404)
    if (Date.now() - new Date(m.created_at).getTime() > 5 * 60 * 1000) return json({ error: 'expirada' }, 400)
    const clean = (s: string) => String(s).replace(/[\r\n]+/g, ' ')
    const body = `Nova mensagem pela página Contato\n\nNome: ${m.name}\nE-mail: ${m.email}\nWhatsApp: ${m.whatsapp}\nData: ${new Date(m.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}\n\nMensagem:\n${m.message}`
    const raw = [`To: ${TO}`, `Reply-To: ${clean(m.email)}`, `Subject: ${hdr('Novo contato no site: ' + clean(m.name))}`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset="UTF-8"', 'Content-Transfer-Encoding: base64', '', b64(body)].join('\r\n')
    const r = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'X-Connection-Api-Key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: b64(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') }),
    })
    if (!r.ok) { const t = await r.text(); console.error(`Gmail [${r.status}]: ${t}`); return json({ error: 'Falha ao enviar e-mail' }, 502) }
    return json({ ok: true })
  } catch (e) { console.error(e); return json({ error: 'erro interno' }, 500) }
})
