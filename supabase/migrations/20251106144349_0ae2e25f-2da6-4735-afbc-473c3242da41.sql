-- Limpar roles órfãos de super_admin
DELETE FROM public.user_roles 
WHERE role = 'super_admin' 
AND user_id NOT IN (SELECT id FROM auth.users);