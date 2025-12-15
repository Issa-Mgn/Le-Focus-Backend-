-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table Articles
create table public.articles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text, 
  category text,
  author text,
  cover_image_url text,
  gallery_image_urls text[], 
  pdf_url text,
  downloads integer default 0,
  views integer default 0,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table Orders (Commandes)
create type order_type as enum ('insertion', 'abonnement', 'publi_reportage', 'publi_redaction');
create type order_status as enum ('pending', 'confirmed', 'paid');

create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  type order_type not null,
  client_info jsonb not null, 
  details jsonb not null, 
  total_price numeric,
  status order_status default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table Users (Admins)
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password_hash text not null,
  role text default 'admin',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table Comments
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  article_id uuid references public.articles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  author_name text not null,
  email text,
  content text not null,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);