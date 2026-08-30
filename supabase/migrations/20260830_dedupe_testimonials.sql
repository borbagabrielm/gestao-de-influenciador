-- Remove depoimentos duplicados (a seed rodou mais de uma vez), mantendo a linha mais antiga de cada

delete from landing_page_testimonials t
using landing_page_testimonials t2
where t.handle = t2.handle
  and t.landing_page_id = t2.landing_page_id
  and t.created_at > t2.created_at;
