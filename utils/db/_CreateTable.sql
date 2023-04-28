create table documents (
  id bigserial primary key,
  content text,
  url text,
  embedding vector (1536),
  timestamp timestamp with time zone not null default now()
);
