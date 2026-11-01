const publicPaths = new Set(['/', '/produtos', '/loja', '/pedidos', '/shopee', '/blog', '/entrar', '/redefinir-senha', '/politica-privacidade', '/termos-de-uso']);
export function trackedPath(pathname: string, consent: string | null) {
  return consent === 'true' && publicPaths.has(pathname) ? pathname : null;
}