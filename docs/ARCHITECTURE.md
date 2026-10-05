# System Architecture

## Frontend
Vite → JavaScript modules → UI components/services → Supabase client.

## Authentication
Supabase Auth provides identity and sessions. Profiles in public.profiles reference auth.users.

## Authorization
PostgreSQL RLS is the authoritative security boundary. The UI may hide controls, but database policies must independently deny unauthorized operations.

## Multi-school data model
School-owned records carry school_id or derive scope through the student/profile relationship. Union and Field scope is modeled separately so cross-school reporting can be authorized explicitly.

## Content
Bible catalog, chapters/verses, lessons and authorized EGW metadata are separate domains. Copyright/license metadata should be tracked before importing third-party content.

## Auditability
Sensitive create/update/delete/approve/export/admin actions should write to system_audit_logs.

## Future backend logic
Use Supabase Edge Functions for privileged server-side operations, integrations, scheduled jobs, or operations requiring secrets. Never place service-role/secret keys in Vite client code.
