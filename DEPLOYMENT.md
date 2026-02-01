# Deploying to Railway

This guide will walk you through deploying this template to Railway.

## 1. Create a New Repository from this Template

Click the **"Use this template"** button at the top of the repository page to create a new repository in your GitHub account. Make sure to include all branches.

## 2. Connect to Railway

- Go to your [Railway dashboard](https://railway.app/dashboard) and create a new project.
- Select **"Deploy from GitHub repo"** and choose the repository you just created.

## 3. Configure Environment Variables

Railway will automatically detect the `railway.toml` file and configure the build and deploy settings. However, you will need to add any secret environment variables.

- In your Railway project, go to the **"Variables"** tab.
- Add the necessary environment variables for your application. Common variables might include:
  - `DATABASE_URL`
  - `API_KEY`
  - Any other secrets your application needs.

## 4. Deploy

Railway will automatically trigger a new deployment whenever you push changes to your GitHub repository. You can also manually trigger a deployment from the Railway dashboard.

## 5. Health Checks

The `railway.toml` file is configured to use a health check at `/setup/healthz`. Ensure your application has a route that responds with a `200 OK` status at this path so Railway can verify your deployment is successful.