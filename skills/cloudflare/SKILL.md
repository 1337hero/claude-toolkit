---
name: cloudflare
description: "Cloudflare APIs: DNS, Workers, Tunnels, zones. Trigger: Cloudflare, DNS records, manage domains."
---

# Cloudflare API

## Authentication

Load the API token before any Cloudflare API call:

```bash
export $(grep CF_API_TOKEN ~/.env | xargs)
```

Then use it in requests:

```bash
curl -s -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/..."
```

## Common Operations

Base URL: `https://api.cloudflare.com/client/v4`

### Zones
- List zones: `GET /zones`
- Zone details: `GET /zones/{zone_id}`

### DNS Records
- List: `GET /zones/{zone_id}/dns_records`
- Create: `POST /zones/{zone_id}/dns_records` with `{"type":"A","name":"...","content":"...","proxied":true}`
- Update: `PATCH /zones/{zone_id}/dns_records/{record_id}`
- Delete: `DELETE /zones/{zone_id}/dns_records/{record_id}`

### Tunnels
- List: `GET /accounts/{account_id}/cfd_tunnel`
- Details: `GET /accounts/{account_id}/cfd_tunnel/{tunnel_id}`

### Workers
- List: `GET /accounts/{account_id}/workers/scripts`
- Upload: `PUT /accounts/{account_id}/workers/scripts/{script_name}`

## Rules

- Always load the token fresh each command (shell state doesn't persist between Bash calls)
- Pipe JSON through `python3 -m json.tool` or `jq` for readability
- For destructive operations (delete records, purge cache), confirm with user first
- Cache zone IDs in the conversation once discovered to avoid repeated lookups
