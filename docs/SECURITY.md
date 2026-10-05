# Security Requirements

1. Never expose Supabase service_role credentials in Vite/browser code.
2. Use Supabase Auth for identity and secure sessions.
3. Enable RLS on sensitive tables.
4. Use role and scope checks for every protected operation.
5. Scope school data by school_id / field / union where applicable.
6. Hash/secure passwords through Auth; never store raw passwords.
7. Validate and sanitize all user-controlled data.
8. Protect academic, discipline and financial records.
9. Record sensitive administrative actions in audit logs.
10. Add confirmation for destructive actions.
11. Use least privilege for non-admin users.
12. Use environment variables only for public client configuration; keep secrets server-side.
13. Add backups/recovery procedures before production.
14. Test authorization independently of the UI.
15. Add rate limiting / abuse controls where appropriate.
16. Support secure logout and session expiry.
17. Review content licensing before importing Bible/EGW texts.
