import { expect, it } from 'vitest';
import { trackedPath } from '@/lib/visitTracking';
it('does not record without acceptance',()=>expect(trackedPath('/produtos',null)).toBe(null));
it('records accepted catalog visits',()=>expect(trackedPath('/produtos','true')).toBe('/produtos'));
it('excludes admin pages',()=>expect(trackedPath('/admin','true')).toBe(null));
it('excludes unrecognized or personal paths',()=>expect(trackedPath('/customer/private-name','true')).toBe(null));
it('rejects query strings',()=>expect(trackedPath('/entrar?email=private','true')).toBe(null));