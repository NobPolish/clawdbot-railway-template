# Build Guide

This document describes the build process for the OpenClaw Railway Template.

## Prerequisites

- Node.js >= 22
- Docker (for container builds)
- npm or pnpm package manager

## Local Development Build

### 1. Install Dependencies

```bash
npm install
```

### 2. Lint the Code

```bash
npm run lint
```

This validates the JavaScript syntax of the wrapper server.

### 3. Run the Application Locally

```bash
npm start
# or
npm run dev
```

The server will start on port 8080 (or the port specified in the PORT environment variable).

### 4. Access the Setup Panel

Navigate to `http://localhost:8080/setup` in your browser.

## Docker Build

### Build the Docker Image

```bash
docker build -t openclaw-railway-template .
```

**Note:** The Docker build process:
1. Clones and builds OpenClaw from source (takes 10-15 minutes)
2. Installs all dependencies
3. Creates a production-ready container image

### Run the Docker Container

```bash
docker run --rm -p 8080:8080 \
  -e PORT=8080 \
  -e SETUP_PASSWORD=your-password \
  -e OPENCLAW_STATE_DIR=/data/.openclaw \
  -e OPENCLAW_WORKSPACE_DIR=/data/workspace \
  -v $(pwd)/.tmpdata:/data \
  openclaw-railway-template
```

### Using Docker Compose

For local development and testing:

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and set your SETUP_PASSWORD
# Then start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

## CI/CD Pipeline

### GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/docker-build.yml`) that:
- Runs on every pull request and push to main
- Validates the Docker build
- Uses Docker layer caching for faster builds
- Ensures no breaking changes to the container build process

### Railway Deployment

The template is configured for Railway deployment:

1. **railway.json** - Main Railway configuration
2. **railway.toml** - Alternative TOML configuration
3. **Dockerfile** - Container build instructions

Railway will automatically:
- Detect the Dockerfile
- Build the container image
- Deploy to a public URL
- Run health checks at `/setup/healthz`
- Restart on failure

## Build Artifacts

The build process generates:

- **node_modules/** - Node.js dependencies (ignored by git)
- **Docker image** - Self-contained runtime image
- **Persistent state** - Stored in volumes at runtime

## Security

### Dependency Security

The build process includes automated security checks:

```bash
npm audit
```

All high-severity vulnerabilities should be addressed before deployment.

### Container Security

The Docker image:
- Uses official Node.js base image
- Runs with minimal privileges
- Stores sensitive files with restricted permissions (mode 0o600)
- Uses multi-stage builds to reduce final image size

## Troubleshooting

### Build Failures

**Issue:** Docker build fails to clone OpenClaw
- **Solution:** Check your internet connection and GitHub access

**Issue:** npm install fails
- **Solution:** Clear npm cache with `npm cache clean --force` and retry

**Issue:** Out of disk space during Docker build
- **Solution:** Clean up Docker resources with `docker system prune`

### Runtime Issues

**Issue:** Server fails to start
- **Solution:** Check that PORT 8080 is available
- **Solution:** Verify all required environment variables are set

**Issue:** Cannot access /setup
- **Solution:** Ensure SETUP_PASSWORD is configured
- **Solution:** Check logs for the auto-generated password

## Performance

### Build Times

- **Local npm install:** < 1 minute
- **Docker build (first time):** 10-15 minutes
- **Docker build (cached):** 2-5 minutes

### Optimizations

- Use Docker BuildKit for faster builds
- Enable layer caching in CI/CD
- Use multi-stage builds to reduce image size
- Minimize dependency count

## Related Documentation

- [README.md](./README.md) - Main project documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) - Railway-specific guide
- [DOCKER_TO_RAILWAY.md](./DOCKER_TO_RAILWAY.md) - Migration guide
