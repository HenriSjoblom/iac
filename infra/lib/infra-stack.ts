import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as logs from "aws-cdk-lib/aws-logs";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. BACKEND: FastAPI + Docker Image + Lambda
    const logGroup = new logs.LogGroup(this, "FastApiLambdaLogs", {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const fastApiLambda = new lambda.DockerImageFunction(
      this,
      "FastApiLambda",
      {
        code: lambda.DockerImageCode.fromImageAsset(
          path.join(__dirname, "../../backend")
        ),
        memorySize: 512,
        timeout: cdk.Duration.seconds(30),
        logGroup: logGroup,
      }
    );

    // Create API without CORS first
    const api = new apigateway.LambdaRestApi(this, "FastApiEndpoint", {
      handler: fastApiLambda,
      proxy: true,
    });

    // 2. FRONTEND: React/Vite + S3 + CloudFront

    const websiteBucket = new s3.Bucket(this, "ReactAppBucket", {
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
    });

    // Parse the API Gateway URL
    const apiDomain = cdk.Fn.select(2, cdk.Fn.split("/", api.url));
    const apiStage = cdk.Fn.select(3, cdk.Fn.split("/", api.url)); // This is 'prod'

    // Create the CloudFront distribution
    const distribution = new cloudfront.Distribution(
      this,
      "ReactViteAppDistribution",
      {
        defaultRootObject: "index.html",
        errorResponses: [
          // For React Router
          {
            httpStatus: 404,
            responsePagePath: "/index.html",
            responseHttpStatus: 200,
          },
          {
            httpStatus: 403,
            responsePagePath: "/index.html",
            responseHttpStatus: 200,
          },
        ],

        // Set the default behavior to S3
        defaultBehavior: {
          origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          // Allow GET, HEAD, OPTIONS
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        },

        //  Add an API behavior for '/api/*'
        additionalBehaviors: {
          "/api/*": {
            origin: new origins.HttpOrigin(apiDomain, {
              originPath: `/${apiStage}`,
            }),
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
            // Allow all methods (GET, POST, PUT, DELETE, etc.)
            allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
            // Forward all headers, query strings, and cookies for API requests
            cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          },
        },
      }
    );

    // Add CORS after CloudFront is created
    api.root.addCorsPreflight({
      allowOrigins: [`https://${distribution.distributionDomainName}`],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    });

    new s3deploy.BucketDeployment(this, "DeployReactApp", {
      sources: [
        s3deploy.Source.asset(path.join(__dirname, "../../frontend/dist")),
      ],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ["/*"],
    });

    // 3. OUTPUTS
    new cdk.CfnOutput(this, "BackendApiUrl", {
      value: api.url,
      description: "The URL of the FastAPI backend",
    });

    new cdk.CfnOutput(this, "FrontendAppUrl", {
      value: `https://${distribution.distributionDomainName}`,
      description: "The URL of the React frontend",
    });
  }
}
