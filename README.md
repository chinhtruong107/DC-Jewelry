# DCJewelry

DCJewelry is a full-stack jewellery e-commerce platform. It provides a customer storefront and an administration area, with a Laravel REST API, a Next.js frontend, and a MySQL-compatible database.

The project is organised as an application repository with dedicated infrastructure, automation, and Kubernetes-platform repositories. This separation keeps application code, cloud provisioning, configuration management, and cluster deployment configuration independently maintainable.

## Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Laravel 10, PHP 8.2, Laravel Sanctum
- **Database:** MySQL-compatible database
- **Local runtime:** Docker Compose
- **CI/CD:** GitHub Actions
- **Infrastructure & operations:** Terraform, Ansible, AWS EC2
- **Kubernetes platform:** K3s, Helm, Traefik

## Features

- Customer storefront with product catalogue, search, cart, favourites, accounts, and reviews
- Admin area for managing the e-commerce workflow
- Checkout and order management with COD and VNPay
- Contact form and newsletter subscriptions
- Resend email and Gemini integrations

## Repository map

| Repository | Responsibility |
| --- | --- |
| [DCJewelry](https://github.com/chinhtruong107/DCJewelry) | Application source: Laravel API, Next.js storefront, Docker Compose, tests, and CI/CD workflow. |
| [DC-Jewelry-Terraform](https://github.com/chinhtruong107/DC-Jewelry-Terraform) | AWS infrastructure provisioning, networking, security groups, compute, and RDS resources. |
| [DC-Jewelry-Ansible](https://github.com/chinhtruong107/DC-Jewelry-Ansible) | Server configuration and application deployment from the Ansible Control Node. |
| [DC-Jewelry-K3s-Platform](https://github.com/chinhtruong107/DC-Jewelry-K3s-Platform) | Kubernetes/K3s platform configuration, Helm-based application releases, ingress, and environment-specific deployment values. |

## Delivery architecture

### Current EC2 deployment path

Pushes to `main` run backend and frontend CI. When both checks pass, GitHub Actions connects to the Ansible Control Node and starts the deployment script.

```text
Developer push to main
        |
        v
GitHub Actions: Laravel tests + Pint / Next.js lint + build
        |
        v
Ansible Control Node
        |
        v
Ansible deploys DCJewelry to AWS EC2
        |
        v
Next.js frontend <-> Laravel API <-> MySQL-compatible database
```

The Control Node runs:

```text
/home/ubuntu/dc-jewelry-ansible/scripts/deploy.sh
```

The production application checkout is expected at `/home/ubuntu/jewelry`, using the `main` branch. Pull requests run validation only; deployment runs only for successful pushes to `main`.

### K3s platform path

The Kubernetes deployment configuration lives in [DC-Jewelry-K3s-Platform](https://github.com/chinhtruong107/DC-Jewelry-K3s-Platform). It is intentionally separate from this application repository so that Helm values, K3s manifests, ingress settings, and selected image versions can evolve without coupling them to application source changes.

```text
Application image/version
        |
        v
DC-Jewelry-K3s-Platform
        |
        v
K3s + Helm
        |
        v
Traefik Ingress -> Next.js service / Laravel API service -> Database
```

## Local development

### URLs

| Component | URL |
| --- | --- |
| Storefront and admin | http://localhost:3002 |
| Laravel API | http://localhost:8002/api |
| Admin area | http://localhost:3002/admin |

### Run with Docker

```powershell
Copy-Item backend/.env.example backend/.env
docker compose up -d --build
docker compose logs -f backend frontend
```

Configure database and third-party integration values in `backend/.env`. Migrations and demo seeders are disabled by default; enable them only for a disposable local environment:

```powershell
$env:RUN_STARTUP_MIGRATIONS="true"
$env:RUN_SEEDERS="true"
docker compose up -d --build
```

Do not enable demo seeders against production data.

### Run without Docker

Start the API:

```powershell
cd backend
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8002
```

In a second terminal, start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

The frontend calls the API through its same-origin `/api` proxy. Set `NEXT_PUBLIC_API_URL=/api` and configure `LARAVEL_API_URL` to the Laravel API base URL.

## Quality checks

```powershell
cd backend
php artisan test
php vendor/bin/pint --test

cd ../frontend
npm run lint
npm run build
```

These checks are also enforced by `.github/workflows/ci.yml`.

## GitHub Actions secrets

Configure the following repository secrets before enabling deployment from `main`:

| Secret | Description |
| --- | --- |
| `CONTROL_NODE_HOST` | Elastic IP address or hostname of the Ansible Control Node. |
| `CONTROL_NODE_USER` | SSH user, normally `ubuntu`. |
| `CONTROL_NODE_SSH_KEY` | Private SSH key used by GitHub Actions to access the Control Node. |
| `TELEGRAM_BOT_TOKEN` | Optional token for CI and deployment notifications. |
| `TELEGRAM_CHAT_ID` | Optional Telegram chat ID for notifications. |

Never commit SSH keys, database credentials, API keys, environment files, or Terraform state. Rotate any credential that was ever exposed in Git history.

## License

This project is intended for portfolio and demonstration use. Add a project-specific licence before redistribution.
