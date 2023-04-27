create or replace function url_statistics ()
returns table (
  url text,
  embeddings_count bigint,
  last_updated timestamptz
)
language plpgsql
as $$
begin
  return query
  select
    docs.url,
    COUNT(*) as embeddings_count,
    (Select db.timestamp from documents as db where db.url = docs.url limit 1) as last_updated
  from documents as docs
  group by docs.url
  order by last_updated desc;
end;
$$;