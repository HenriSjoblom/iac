# Full-Stack AWS Deployment (FastAPI + React + CDK)

This project is a full-stack web application with a React/Vite frontend and a Python/FastAPI backend. The entire cloud infrastructure is defined as code using the AWS Cloud Development Kit (CDK) with TypeScript, providing a fully reproducible deployment.

The project supports two deployment methods:

**Manual Deployment**: Deploy directly from your local machine using the AWS CDK CLI.

**Automated CI/CD**: A pre-configured GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically builds and deploys the entire stack when changes are pushed to the main branch.

The deployment is idempotent—re-running it will only apply updates without breaking the existing stack—and fully reproducible from the code in this repository.

## Architecture

- **Backend**: A Python FastAPI application packaged as a Docker container and deployed as an AWS Lambda function.

- **Frontend**: A React/Vite application hosted in an Amazon S3 bucket.

- **CDN**: An Amazon CloudFront distribution sits in front of S3 to provide HTTPS, caching, and a single domain for the entire app.

- **API**: An Amazon API Gateway (HTTP API) provides a public URL for the Lambda function.

- **Routing**: The CloudFront distribution is configured to act as a proxy:
  - Requests to the root (`/`) serve the React app from S3.
  - Requests to `/api/*` are automatically forwarded to the API Gateway/Lambda backend. This eliminates CORS issues and simplifies the frontend code.

## Prerequisites

Before you begin, you must have the following tools installed and configured:

### AWS Account & Credentials

- An AWS account
- The AWS CLI installed
- Your credentials configured locally (for example by running `aws configure`)

### Node.js & npm

- Node.js (v22)

### AWS CDK Toolkit

- Install the CDK globally:
  ```bash
  npm install -g aws-cdk
  ```

### Python & uv

- Python 3.12
- uv for Python package management. [uv documentation](https://docs.astral.sh/uv/getting-started/installation/)

### Docker

- Docker Desktop (Windows) or Docker Engine (macOS/Linux) must be installed and running during manual deployment
- The CDK uses Docker to build your backend container image
- **Note**: Ensure the Docker daemon is running before starting the deployment

## How to Deploy and Destroy

You have two ways to deploy the application to AWS.

### Manual Deployment (From Your Machine)

This method builds and deploys the entire stack from your local computer.

#### Bootstrap (First-Time Setup)

If this is your first time using CDK in your AWS account and region, you must bootstrap once:

```bash
cdk bootstrap
```

This uses your configured AWS credentials from `aws configure` and creates the necessary S3 buckets and IAM roles for CDK deployments in your default region.

#### Deployment Steps

1. Navigate to your CDK project folder:

   ```bash
   cd infra
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the full-deploy script (defined in `package.json`):
   ```bash
   npm run deploy:full
   ```

This command automatically:

- Builds the frontend (runs `npm run build` in the frontend folder)
- Builds the backend Docker image
- Deploys all infrastructure (S3, CloudFront, Lambda, API Gateway) via `cdk deploy`

**Note**: You will be asked to approve security-related changes. This is expected. Type `y` and press Enter.

After deployment, the CDK will output your public `FrontendAppUrl` and `BackendApiUrl`.

### Automated Deployment (CI/CD)

This project includes a GitHub Actions workflow defined in `.github/workflows/deploy.yml`.

**Prerequisites**: Add the following as repository secrets in your GitHub project settings:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

**Deploy**: Simply `git push` any changes to your `main` branch.

The GitHub Action will automatically:

- Build your React/Vite frontend
- Build your backend Docker container
- Deploy all infrastructure (S3, CloudFront, Lambda, API Gateway) via CDK

The deployment runs with `--require-approval never` to execute non-interactively in the CI/CD pipeline.

### Destroy the Infrastructure

To tear down all the AWS resources created by this stack (and stop all billing), run:

```bash
cd infra
cdk destroy
```

## Non-Idealities & Missing Parts

### No Authentication or Authorization

The API is currently publicly accessible without any authentication. Anyone who discovers the API Gateway URL can make requests directly, bypassing CloudFront entirely. This poses security risks.

### CI/CD Security

The GitHub Action uses long-lived IAM User keys (`AWS_ACCESS_KEY_ID`). A more secure, production-grade approach would be to use OIDC (OpenID Connect) with a short-lived IAM Role.

### Log Retention

The Lambda log groups are set to be destroyed (`logRemovalPolicy: cdk.RemovalPolicy.DESTROY`) when the stack is destroyed. For a production app, you would want to set this to `RETAIN` to keep your logs.


## How to Run Locally

### Run the Backend

1. Open a terminal and navigate to the backend folder:

   ```bash
   cd backend
   ```

2. Run the FastAPI app:
   ```bash
   uv run uvicorn main:app --port 8000
   ```

Your backend is now running at `http://localhost:8000`.

### Run the Frontend

1. Open a second terminal and navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the dev server:
   ```bash
   npm run dev
   ```

Your frontend is now running at `http://localhost:5173`. The `vite.config.ts` file is configured to proxy all `/api` requests to your backend at `localhost:8000`.
