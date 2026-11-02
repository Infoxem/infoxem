alter table public.finding_companies add column company_name text;
update public.finding_companies f set company_name=c.name, updated_at=clock_timestamp() from public.imported_companies c where c.id=f.id;
alter table public.finding_companies alter column company_name set not null;
alter table public.finding_companies add constraint finding_company_name_present check (btrim(company_name) <> '');
notify pgrst, 'reload schema';
