#!/bin/sh

set -eu

app_dir=/opt/liyaro
backup_dir=/var/backups/liyaro/postgres
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
destination="$backup_dir/liyaro-$timestamp.dump"
temporary="$destination.tmp"

umask 077
mkdir -p "$backup_dir"
cd "$app_dir"

cleanup() {
  rm -f "$temporary"
}
trap cleanup EXIT INT TERM

docker compose --env-file .env.production -f compose.production.yml exec -T db \
  sh -c 'exec pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --compress=9' \
  > "$temporary"

test -s "$temporary"
mv "$temporary" "$destination"
trap - EXIT INT TERM

find "$backup_dir" -type f -name 'liyaro-*.dump' -mtime +13 -delete

