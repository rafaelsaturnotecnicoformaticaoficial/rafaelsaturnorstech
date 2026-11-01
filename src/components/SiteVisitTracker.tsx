import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { trackedPath } from '@/lib/visitTracking';

export default function SiteVisitTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    let started = false;
    const start = () => {
      if (started || !trackedPath(pathname, localStorage.getItem('cookie-consent'))) return;
      started = true;
      let session = sessionStorage.getItem('site-visit-session');
      if (!session) { session = crypto.randomUUID(); sessionStorage.setItem('site-visit-session', session); }
      const id = session;
      const record = (view: boolean) => {
        if (document.visibilityState !== 'visible') return;
        void supabase.rpc('record_site_visit', { _session: id, _path: pathname, _view: view }).then(() => undefined);
      };
      record(true);
      timer = setInterval(() => record(false), 30000);
    };
    start();
    window.addEventListener('cookie-consent-changed', start);
    return () => { if (timer) clearInterval(timer); window.removeEventListener('cookie-consent-changed', start); };
  }, [pathname]);
  return null;
}