import { S3Client } from "@aws-sdk/client-s3";

const isTestEnv = process.env.NODE_ENV === "test";

let s3ClientInstance = null;

function validateConfig() {
  const required = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "AWS_S3_BUCKET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required AWS environment variables: ${missing.join(", ")}`);
  }
}

export function getS3Client() {
  if (isTestEnv) return null;

  if (!s3ClientInstance) {
    validateConfig();
    s3ClientInstance = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  return s3ClientInstance;
}

export function getBucketName() {
  if (isTestEnv) return "test-bucket";

  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    throw new Error("Missing required environment variable: AWS_S3_BUCKET");
  }
  return bucket;
}



