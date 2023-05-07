create or replace function delete_url(
  query_url text, out _count int
)
language plpgsql
as $$
begin
    with deleted as 
    (delete from documents 
    where url like '%'||query_url is true returning *) 
    select count(*) from deleted into _count;
end;
$$;