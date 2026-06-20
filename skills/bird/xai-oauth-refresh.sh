#!/usr/bin/env bash
# Refresh ~/.grok/auth.json using Firefox X.com session cookies
# No browser interaction required — uses existing sso cookie from .x.ai domain

set -euo pipefail

FF_PROFILE="$HOME/.mozilla/firefox/u80t1430.default-release"
AUTH_PATH="$HOME/.grok/auth.json"
CLIENT_ID="b1a00492-073a-47ea-816f-4c329264a828"
SCOPE_KEY="https://auth.x.ai::${CLIENT_ID}"
SCOPE="openid profile email offline_access grok-cli:access api:access"
REDIRECT_URI="http://127.0.0.1:56121/callback"

# --- Extract cookies from Firefox ---
cp "${FF_PROFILE}/cookies.sqlite" /tmp/xai_ff_cookies.sqlite
eval "$(sqlite3 /tmp/xai_ff_cookies.sqlite "
  SELECT 'SSO=' || value FROM moz_cookies WHERE host LIKE '%.x.ai' AND name='sso' LIMIT 1;
  SELECT 'CF_CLEARANCE=' || value FROM moz_cookies WHERE host LIKE '%.x.ai' AND name='cf_clearance' ORDER BY lastAccessed DESC LIMIT 1;
  SELECT 'CUID=' || value FROM moz_cookies WHERE host LIKE '%.x.ai' AND name='__cuid' LIMIT 1;
" | head -3)"
rm /tmp/xai_ff_cookies.sqlite

COOKIE_HDR="sso=${SSO}; sso-rw=${SSO}; cf_clearance=${CF_CLEARANCE}; __cuid=${CUID}"
UA="Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0"

# --- PKCE ---
VERIFIER=$(python3 -c "import secrets,base64; print(base64.urlsafe_b64encode(secrets.token_bytes(32)).rstrip(b'=').decode())")
CHALLENGE=$(python3 -c "import hashlib,base64; print(base64.urlsafe_b64encode(hashlib.sha256('${VERIFIER}'.encode()).digest()).rstrip(b'=').decode())")
STATE=$(python3 -c "import secrets; print(secrets.token_hex(16))")

SCOPE_ENC=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${SCOPE}'))")

AUTH_URL="https://auth.x.ai/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${REDIRECT_URI}'))")&scope=${SCOPE_ENC}&state=${STATE}&code_challenge=${CHALLENGE}&code_challenge_method=S256"

# --- Get authorization code ---
LOCATION=$(curl -s -o /dev/null -w "%{redirect_url}" --max-redirs 0 \
  -X POST \
  -H "Cookie: ${COOKIE_HDR}" \
  -H "User-Agent: ${UA}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  "https://auth.x.ai/oauth2/authorize" \
  -d "response_type=code&client_id=${CLIENT_ID}&redirect_uri=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${REDIRECT_URI}'))")&scope=${SCOPE_ENC}&state=${STATE}&code_challenge=${CHALLENGE}&code_challenge_method=S256")

CODE=$(python3 -c "import urllib.parse; qs=urllib.parse.urlparse('${LOCATION}').query; print(urllib.parse.parse_qs(qs)['code'][0])")

# --- Exchange for tokens ---
TOKENS=$(curl -s -X POST "https://auth.x.ai/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&client_id=${CLIENT_ID}&code=${CODE}&redirect_uri=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${REDIRECT_URI}'))")&code_verifier=${VERIFIER}")

# --- Write ~/.grok/auth.json ---
python3 -c "
import json, os, time
data = {}
auth_path = os.path.expanduser('~/.grok/auth.json')
if os.path.exists(auth_path):
    with open(auth_path) as f: data = json.load(f)
tokens = json.loads('''${TOKENS}''')
data['${SCOPE_KEY}'] = {
    'key': tokens['access_token'],
    'refresh_token': tokens.get('refresh_token', ''),
    'expires_at': int((time.time() + tokens.get('expires_in', 21600)) * 1000),
}
os.makedirs(os.path.dirname(auth_path), exist_ok=True)
with open(auth_path, 'w') as f: json.dump(data, f, indent=2)
print('✅ ~/.grok/auth.json updated — restart pi to pick up new tokens')
"
