#!/bin/sh
# Fetches the Mapbox access token used by CI for fork PRs (no secrets there).
# The token is public by design — obfuscation only defeats token scrapers /
# secret scanning; rotation (2x/week, see rnmapbox/ci-config) is the real defense.
# -md sha256 instead of -pbkdf2 for LibreSSL compat on macOS runners.
set -eu

URL="https://raw.githubusercontent.com/rnmapbox/ci-config/main/mapbox-ci-token.v1.enc"
OBFUSCATION_KEY="93b0fa94d67b3e1a5f2e59d920bc4854"

curl -fsSL "$URL" | openssl enc -d -aes-256-cbc -base64 -A -md sha256 -k "$OBFUSCATION_KEY"
