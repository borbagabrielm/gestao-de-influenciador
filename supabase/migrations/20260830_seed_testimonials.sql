-- Depoimentos sugeridos (sem foto de perfil) para a página Mídia Kit

insert into landing_page_testimonials (landing_page_id, name, handle, comment, position)
select id, 'Caroline Borstmann', 'caroulinessb', 'Errado mesmo é tu não ter um milhão de seguidores com esses conteúdos perfeitosss', 0
from landing_pages where slug = 'midia-kit'
union all
select id, 'Amanda Arenhardt', 'amandaarenhardt', 'Eu não tenho onde usar tantas inspirações de looks que eu recebo aqui nesse perfil', 1
from landing_pages where slug = 'midia-kit'
union all
select id, 'Thaís Àvila', 'thaisavila', 'É um conteúdo mais incrível que o outrooooooo 💜💜💜💜', 2
from landing_pages where slug = 'midia-kit';
