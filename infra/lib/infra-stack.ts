import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ========================================================================
    // 1. BACKEND: FastAPI + Docker Image + Lambda (Free Tier)
    // ========================================================================

    const logGroup = new logs.LogGroup(this, 'FastApiLambdaLogs', {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const fastApiLambda = new lambda.DockerImageFunction(this, 'FastApiLambda', {
      code: lambda.DockerImageCode.fromImageAsset(
        path.join(__dirname, '../../backend') // <-- Points to /backend
      ),
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
    });

    // The API Gateway part is IDENTICAL to the previous Lambda plan
    const api = new apigateway.LambdaRestApi(this, 'FastApiEndpoint', {
      handler: fastApiLambda,
      proxy: true,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // ========================================================================
    // 2. FRONTEND: React/Vite + S3 + CloudFront
    // ========================================================================

    const websiteBucket = new s3.Bucket(this, 'ReactViteAppBucket', {
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const distribution = new cloudfront.Distribution(this, 'ReactViteAppDistribution', {
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    new s3deploy.BucketDeployment(this, 'DeployReactApp', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../frontend/dist'))],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // ========================================================================
    // 3. OUTPUTS
    // ========================================================================

    new cdk.CfnOutput(this, 'BackendApiUrl', {
      value: api.url,
      description: 'The URL of the FastAPI backend',
    });

    new cdk.CfnOutput(this, 'FrontendAppUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'The URL of the React frontend',
    });
  }
}