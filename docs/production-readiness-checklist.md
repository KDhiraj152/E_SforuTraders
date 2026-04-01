# Production readiness checklist

Use this checklist before every production release.

## Security

- [ ] No plaintext credentials in repository
- [ ] `.env*` files excluded from git
- [ ] JWT secret is 32+ bytes and rotated by policy
- [ ] Admin or default credentials removed or replaced
- [ ] CORS restricted to real frontend domains
- [ ] TLS enabled in all external environments
- [ ] Compose deployment uses explicit env file (`docker compose --env-file ...`)

## Backend quality

- [ ] API request validation enabled for all write endpoints
- [ ] Global exception mapping returns consistent error payloads
- [ ] Pagination enforced on list endpoints
- [ ] No stack traces leaked in production responses
- [ ] Structured logs enabled without sensitive data

## Frontend quality

- [ ] API base URL points to production gateway
- [ ] Token handling is secure and predictable
- [ ] User-visible error states exist for failed requests
- [ ] Build artifacts generated successfully
- [ ] Lint baseline is clean or accepted exceptions are documented

## Data and operations

- [ ] Database backups tested
- [ ] Restore procedure documented and tested
- [ ] Migration strategy documented
- [ ] Monitoring dashboards are in place
- [ ] Alert routing confirmed

## Release controls

- [ ] Tagged release created
- [ ] Deployment notes prepared
- [ ] Smoke tests passed after deployment
- [ ] Rollback steps validated
- [ ] `./setup.sh`, `./start.sh`, and `./stop.sh` validated on target host

## Final sign-off

- [ ] Backend owner approval
- [ ] Frontend owner approval
- [ ] DevOps owner approval
- [ ] Security owner approval

---

Edited by K Dhiraj ([k.dhiraj.srihari@gmail.com](mailto:k.dhiraj.srihari@gmail.com))  
GitHub: KDhiraj152
