export default {
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "dev_secret",
  AWS_REGION: process.env.AWS_REGION || "sa-east-1",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  S3_BUCKET_NAME: process.env.AWS_S3_IMAGES_BUCKET || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "",
  APP_URL: process.env.APP_URL || "",
  SENDINBLUE_API_KEY: process.env.SENDINBLUE_API_KEY || "",
  SNS_IOS_PUSH_NOTIFICATIONS_ARN:
    process.env.SNS_IOS_PUSH_NOTIFICATIONS_ARN || "",
  SNS_ANDROID_PUSH_NOTIFICATIONS_ARN:
    process.env.SNS_ANDROID_PUSH_NOTIFICATIONS_ARN || "",
  REGION: process.env.AWS_REGION || "sa-east-1",
  PORT: process.env.PORT || "3000",
  NODE_ENV: process.env.NODE_ENV || "development",
};
