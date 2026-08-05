# DCJewelry

Full-stack jewelry e-commerce application built with Laravel, Next.js, MySQL, Docker Compose, GitHub Actions, Ansible, and AWS EC2.

## Related infrastructure repositories

This application is deployed with two companion repositories:

- [DC-Jewelry-Ansible](https://github.com/chinhtruong107/DC-Jewelry-Ansible) — server configuration and application deployment.
- [DC-Jewelry-Terraform](https://github.com/chinhtruong107/DC-Jewelry-Terraform) — AWS infrastructure provisioning.

## Architecture

Infrastructure provisioning is maintained in [DC-Jewelry-Terraform](https://github.com/chinhtruong107/DC-Jewelry-Terraform). Server configuration and deployment are maintained in [DC-Jewelry-Ansible](https://github.com/chinhtruong107/DC-Jewelry-Ansible).

```text
Push DCJewelry to main
  -> Backend CI + Frontend CI
  -> SSH to Ansible Control Node
  -> /home/ubuntu/dc-jewelry-ansible/scripts/deploy.sh
  -> Ansible deploys the app to production EC2
```

Deployment runs only after backend and frontend CI succeed on a push to `main`. Pull requests run validation only.

The Control Node must be able to pull this public repository. The production checkout is expected at `/home/ubuntu/jewelry` and uses the `main` branch.

## Features

- Customer storefront and admin area
- Product catalog, search, cart, favorites, accounts, and reviews
- COD/VNPay checkout and order management
- Contact and newsletter subscriptions
- Resend and Gemini integrations

## Local URLs

| Component | URL |
| --- | --- |
| Storefront and admin | http://localhost:3002 |
| Laravel API | http://localhost:8002/api |
| Admin area | http://localhost:3002/admin |

## Run with Docker

```powershell
Copy-Item backend/.env.example backend/.env
docker compose up -d --build
docker compose logs -f backend frontend
```

Configure database and integration values in `backend/.env`. Startup migrations and demo seeders are opt-in:

```powershell
$env:RUN_STARTUP_MIGRATIONS="true"
$env:RUN_SEEDERS="true"
docker compose up -d --build
```

Do not enable demo seeders against production data.

## Run without Docker

```powershell
cd backend
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8002
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend uses the same-origin `/api` proxy. Set `NEXT_PUBLIC_API_URL=/api` and configure `LARAVEL_API_URL` for Laravel.

## Quality checks

```powershell
cd backend
php artisan test
php vendor/bin/pint --test
cd ../frontend
npm run lint
npm run build
```

These checks run in `.github/workflows/ci.yml`.

## GitHub Actions secrets

Add these secrets before pushing to `main`:

| Secret | Description |
| --- | --- |
| `CONTROL_NODE_HOST` | Elastic IP or hostname of the Control Node |
| `CONTROL_NODE_USER` | SSH user, normally `ubuntu` |
| `CONTROL_NODE_SSH_KEY` | Private SSH key for the Control Node |
| `TELEGRAM_BOT_TOKEN` | Optional CI notification bot token |
| `TELEGRAM_CHAT_ID` | Optional CI notification chat ID |

Never commit SSH keys, database credentials, API keys, environment files, or Terraform state. Rotate any credential previously exposed in Git history.

## License

This project is intended for portfolio and demonstration use. Add a project-specific license before allowing redistribution.
