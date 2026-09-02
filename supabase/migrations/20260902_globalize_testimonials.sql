-- Depoimentos deixam de pertencer a uma landing page específica e passam a ser
-- compartilhados entre todas elas (próximas landing pages vão puxar o mesmo pool).

alter table landing_page_testimonials drop constraint if exists landing_page_testimonials_landing_page_id_fkey;
alter table landing_page_testimonials drop column if exists landing_page_id;
alter table landing_page_testimonials rename to testimonials;
