-- Remove o módulo de depoimentos por completo — a seção de prova social foi
-- tirada do mídia kit e de todas as landing pages, não vamos mais usar.
--
-- ATENÇÃO: isso apaga permanentemente todos os depoimentos já cadastrados
-- (nome, @, comentário, foto). Não tem como desfazer depois de rodar. Se
-- quiser guardar uma cópia antes, exporte a tabela pelo Supabase Studio
-- (Table Editor → testimonials → Export) antes de rodar este arquivo.

drop table if exists testimonials;
