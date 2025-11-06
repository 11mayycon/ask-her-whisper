-- Forçar deleção de todos os registros super_admin
DELETE FROM public.user_roles WHERE role = 'super_admin';

-- Verificar se existem usuários órfãos e deletá-los
DO $$
DECLARE
  orphan_user RECORD;
BEGIN
  FOR orphan_user IN 
    SELECT id FROM auth.users 
    WHERE id NOT IN (SELECT user_id FROM public.user_roles)
    AND email LIKE '%maiconsi%'
  LOOP
    -- Nota: Esta operação deve ser feita com cuidado em produção
    RAISE NOTICE 'Encontrado usuário órfão: %', orphan_user.id;
  END LOOP;
END $$;