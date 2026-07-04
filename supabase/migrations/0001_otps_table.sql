create table public.otps (
    id uuid default gen_random_uuid() primary key,
    email text not null,
    otp text not null,
    name text,
    password text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    expires_at timestamp with time zone not null
);

-- Optional: Create an index for faster lookups
create index otps_email_idx on public.otps (email);

-- Enable RLS
alter table public.otps enable row level security;

-- Allow anon to insert OTPs
create policy "Anon can insert OTPs" on public.otps for insert to anon with check (true);

-- Allow anon to read OTPs (we will query by email and otp)
create policy "Anon can read OTPs" on public.otps for select to anon using (true);

