# Project rules
- Authenticate admin access through the backend `has_role` function for the signed-in user; never infer privileges from client storage or an unfiltered roles query.
- Keep current catalog administration separate from legacy shop administration because they use different order and product models.
- Track consented public page views without query strings using per-tab random IDs; use throttled database heartbeats and effect-scoped realtime subscriptions for admin analytics.
- Customer removal deletes only the profile through an admin-checked RPC, protecting administrator profiles and preserving accounts and order history.
- Management reports aggregate the current order model in the database, using São Paulo date boundaries and excluding cancelled orders from order value; completed value is not verified payment revenue.