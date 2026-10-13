# Project rules
- Authenticate admin access through the backend `has_role` function for the signed-in user; never infer privileges from client storage or an unfiltered roles query.
- Keep current catalog administration separate from legacy shop administration because they use different order and product models.