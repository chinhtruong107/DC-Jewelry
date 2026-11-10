# DCJewelry
DCJewelry is a full-stack jewellery e-commerce platform. It provides a customer storefront and an administration area, with a Laravel REST API, a Next.js frontend, and a MySQL-compatible database.

The project is organised as an application repository with dedicated infrastructure, automation, and Kubernetes-platform repositories. This separation keeps application code, cloud provisioning, configuration management, and cluster deployment configuration independently maintainable.

## Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Laravel 10, PHP 8.2, Laravel Sanctum
- **Database:** MySQL-compatible database
- **Local runtime:** Docker Compose
- **CI/CD:** GitHub Actions (build, test, deploy to K3s)
- **Infrastructure & operations:** Terraform, Ansible, AWS EC2
- **Kubernetes platform:** K3s, Kustomize, Traefik

## Features

- Customer storefront with product catalogue, search, cart, favourites, accounts, and reviews
- Admin area for managing the e-commerce workflow
- Checkout and order management with COD and VNPay
- Resend email and Gemini integrations
- Telegram notifications for CI and deployment results

## Repository map

| Repository | Responsibility |
| --- | --- |
| [DCJewelry](https://github.com/chinhtruong107/DCJewelry) | Application source: Laravel API, Next.js storefront, Docker Compose, tests, and CI image build workflow. |
| [DC-Jewelry-Terraform](https://github.com/chinhtruong107/DC-Jewelry-Terraform) | AWS infrastructure provisioning, networking, security groups, compute, and RDS resources. |
| [DC-Jewelry-Ansible](https://github.com/chinhtruong107/DC-Jewelry-Ansible) | K3s server/worker bootstrap and operational configuration from the Ansible Control Node. |
| [DC-Jewelry-K3s-Platform](https://github.com/chinhtruong107/DC-Jewelry-K3s-Platform) | Kubernetes/K3s manifests, Kustomize overlays, migration job, Traefik ingress, and environment-specific deployment configuration. |

## Delivery architecture

### K3s CI/CD path

Pushes to `main` validate the Laravel API and Next.js frontend, notify the CI result, then publish versioned application images. GitHub Actions connects to the Control Node and runs `DC-Jewelry-K3s-Platform/scripts/deploy.sh`; that script applies the matching Kustomize overlay, runs the migration Job, and waits for the rollout before the final deployment notification.

```text
Developer push to main
        |
        v
GitHub Actions: Laravel tests + Pint / Next.js lint + build
        |
        v
CI result notification
        |
        v
Build and publish versioned backend + frontend images
        |
        v
SSH to Control Node: run DC-Jewelry-K3s-Platform/scripts/deploy.sh
        |
        v
Kustomize apply from the Control Node
        |
        v
K3s Server + Traefik -> frontend/API pods on K3s worker -> private RDS
```

Terraform provisions the AWS network and compute resources. Ansible bootstraps and administers K3s; it does not deploy the application directly to Docker Compose hosts. The Platform repository owns the application manifests and deployment order:

```text
Namespace -> Secret -> application overlay -> migration Job -> rollout checks -> Traefik/EIP check
```

The backend listens on port `8002` and the frontend on port `3002`. Images must use an explicit versioned tag; do not deploy `latest`. Pull requests run validation only.

### K3s platform path

The Kubernetes deployment configuration lives in [DC-Jewelry-K3s-Platform](https://github.com/chinhtruong107/DC-Jewelry-K3s-Platform). It is intentionally separate from this application repository so that Kustomize overlays, K3s manifests, ingress settings, and selected image versions can evolve without coupling them to application source changes.

```text
Application image/version
        |
        v
DC-Jewelry-K3s-Platform: Kustomize overlay
        |
        v
K3s cluster
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

Configure the following repository secrets for CI image publishing and notifications:

| Secret | Description |
| --- | --- |
| `DOCKERHUB_USERNAME` | Docker Hub account that owns the application image repositories; it must match the image owner configured in the Platform repository. |
| `DOCKERHUB_TOKEN` | Docker Hub access token used to publish images. |
| `CONTROL_NODE_HOST` | Elastic IP address or hostname of the K3s Control Node. |
| `CONTROL_NODE_USER` | SSH user for the Control Node, normally `ubuntu`. |
| `CONTROL_NODE_SSH_KEY` | Private SSH key used by GitHub Actions to run the K3s release script. |
| `TELEGRAM_BOT_TOKEN` | Optional token for CI and deployment notifications. |
| `TELEGRAM_CHAT_ID` | Optional Telegram chat ID for notifications. |

Configure these optional GitHub Actions variables when the defaults do not match the Control Node:

| Variable | Default | Description |
| --- | --- | --- |
| `K3S_PLATFORM_DIR` | `/home/ubuntu/dc-jewelry-k3s-platform` | Local checkout of the K3s Platform repository on the Control Node. |
| `K3S_OVERLAY` | `aws-domain` | Kustomize overlay to deploy: `aws-domain` or `aws-ip`. |

Never commit SSH keys, database credentials, API keys, environment files, or Terraform state. Rotate any credential that was ever exposed in Git history.

## License

This project is intended for portfolio and demonstration use. Add a project-specific licence before redistribution.
