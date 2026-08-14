# Production deployment

The production stack runs Caddy, the Fastify backend, and PostgreSQL in Docker
Compose. Only ports 80 and 443 are published; PostgreSQL and the backend remain
inside the private Compose network.

## First deployment

```sh
cp .env.production.example .env.production
chmod 600 .env.production
docker compose --env-file .env.production -f compose.production.yml up -d --build
```

Use a long random PostgreSQL password and a Yandex application password in
`.env.production`. Never commit that file.

## Update

```sh
git pull --ff-only
docker compose --env-file .env.production -f compose.production.yml up -d --build
docker image prune -f
```

## Status and logs

```sh
docker compose --env-file .env.production -f compose.production.yml ps
docker compose --env-file .env.production -f compose.production.yml logs --tail=100
```

## Database backups

Install the supplied systemd units after the first successful deployment:

```sh
install -m 0644 deploy/systemd/liyaro-backup.service /etc/systemd/system/
install -m 0644 deploy/systemd/liyaro-backup.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now liyaro-backup.timer
```

The timer creates a PostgreSQL custom-format dump in
`/var/backups/liyaro/postgres` every night and retains 14 daily copies. These
local dumps protect against accidental data changes, but an encrypted copy must
also be synchronized to storage outside this VPS.

