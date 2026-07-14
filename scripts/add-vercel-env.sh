#!/bin/bash
# Script to add environment variables from .env and .env.local to Vercel project

# Ensure we have vercel command
if ! command -v vercel &> /dev/null; then
  echo "Vercel CLI not found."
  exit 1
fi

add_to_vercel() {
  key=$1
  value=$2
  if [ -n "$value" ] && [ "$key" != "TMDB_API_KEY" ]; then
    echo "Configuring $key on Vercel..."
    vercel env add "$key" production --value "$value" --yes --force &> /dev/null
    vercel env add "$key" preview --value "$value" --yes --force &> /dev/null
    vercel env add "$key" development --value "$value" --yes --force &> /dev/null
  fi
}

# Read .env
if [ -f .env ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    [[ "$line" =~ ^#.*$ ]] && continue
    [[ -z "$line" ]] && continue
    key=$(echo "$line" | cut -d'=' -f1)
    value=$(echo "$line" | cut -d'=' -f2- | sed -e 's/^"//' -e 's/"$//')
    add_to_vercel "$key" "$value"
  done < .env
fi

# Read .env.local
if [ -f .env.local ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    [[ "$line" =~ ^#.*$ ]] && continue
    [[ -z "$line" ]] && continue
    key=$(echo "$line" | cut -d'=' -f1)
    value=$(echo "$line" | cut -d'=' -f2- | sed -e 's/^"//' -e 's/"$//')
    add_to_vercel "$key" "$value"
  done < .env.local
fi

echo "Environment configuration complete!"
