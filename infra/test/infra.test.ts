import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as Infra from "../lib/infra-stack";
import * as fs from "fs";
import * as path from "path";

// Create a mock dist directory for testing
beforeAll(() => {
  const distPath = path.join(__dirname, "../../frontend/dist");
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
    fs.writeFileSync(path.join(distPath, "index.html"), "<html></html>");
  }
});

test("Stack Creates Correct Resources", () => {
  const app = new cdk.App();

  const stack = new Infra.InfraStack(app, "MyTestStack");

  const template = Template.fromStack(stack);

  // 1. Test for the Lambda Function (FastAPI backend)
  template.hasResourceProperties("AWS::Lambda::Function", {
    PackageType: "Image",
    MemorySize: 512,
    Timeout: 30,
  });

  // 2. Test for the API Gateway REST API
  template.hasResourceProperties("AWS::ApiGateway::RestApi", {
    Name: "FastApiEndpoint",
  });

  // 3. Test for the S3 Bucket (for the frontend)
  template.hasResourceProperties("AWS::S3::Bucket", {
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true,
    },
  });

  // 4. Test for the CloudFront Distribution
  template.hasResourceProperties("AWS::CloudFront::Distribution", {
    DistributionConfig: {
      // Check that the React Router error handling is set up
      CustomErrorResponses: [
        {
          ErrorCode: 404,
          ResponseCode: 200,
          ResponsePagePath: "/index.html",
        },
        {
          ErrorCode: 403,
          ResponseCode: 200,
          ResponsePagePath: "/index.html",
        },
      ],
      // Check that the default origin is the S3 bucket
      DefaultCacheBehavior: {
        ViewerProtocolPolicy: "redirect-to-https",
      },
    },
  });

  // 5. Test that the Bucket Deployment (file upload) is present
  template.hasResource("Custom::CDKBucketDeployment", {});

  // 6. Test for Lambda execution role (created automatically)
  template.hasResourceProperties("AWS::IAM::Role", {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: "sts:AssumeRole",
          Effect: "Allow",
          Principal: {
            Service: "lambda.amazonaws.com",
          },
        },
      ],
    },
  });
});

test("API Gateway has CORS configured", () => {
  const app = new cdk.App();
  const stack = new Infra.InfraStack(app, "MyTestStack");
  const template = Template.fromStack(stack);

  // Check for CORS method (OPTIONS)
  template.hasResourceProperties("AWS::ApiGateway::Method", {
    HttpMethod: "OPTIONS",
  });
});

test("CloudFront uses HTTPS redirect", () => {
  const app = new cdk.App();
  const stack = new Infra.InfraStack(app, "MyTestStack");
  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::CloudFront::Distribution", {
    DistributionConfig: {
      DefaultCacheBehavior: {
        ViewerProtocolPolicy: "redirect-to-https",
      },
    },
  });
});
