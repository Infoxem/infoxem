alter table public.finding_companies drop constraint finding_has_data;
update public.finding_companies f set
 address = array(select distinct v from unnest(f.address || f.location) as values(v) order by v),
 evidence = (select coalesce(jsonb_agg(case when item->>'field' = 'location' then jsonb_set(item, '{field}', '"address"') else item end order by ord), '[]'::jsonb) from jsonb_array_elements(f.evidence) with ordinality as entries(item,ord)),
 updated_at = clock_timestamp();
alter table public.finding_companies drop column location;
alter table public.finding_companies add constraint finding_has_data check (
 cardinality(phone_mobile) + cardinality(email) + cardinality(website) + cardinality(address) > 0
);
notify pgrst, 'reload schema';
