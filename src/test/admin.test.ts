import { beforeEach, describe, expect, it, vi } from 'vitest';
const {getUser,rpc}=vi.hoisted(()=>({getUser:vi.fn(),rpc:vi.fn()}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{auth:{getUser},rpc}}));
import { checkAdminAccess } from '@/lib/admin';
describe('admin access',()=>{
  beforeEach(()=>vi.resetAllMocks());
  it('rejects a signed out visitor',async()=>{getUser.mockResolvedValue({data:{user:null},error:null});expect(await checkAdminAccess()).toBe(false);expect(rpc).not.toHaveBeenCalled();});
  it('checks the signed in user through has_role',async()=>{getUser.mockResolvedValue({data:{user:{id:'admin-id'}},error:null});rpc.mockResolvedValue({data:true,error:null});expect(await checkAdminAccess()).toBe(true);expect(rpc).toHaveBeenCalledWith('has_role',{_user_id:'admin-id',_role:'admin'});});
  it('rejects a user without the backend admin role',async()=>{getUser.mockResolvedValue({data:{user:{id:'customer-id'}},error:null});rpc.mockResolvedValue({data:false,error:null});expect(await checkAdminAccess()).toBe(false);});
});