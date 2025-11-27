import { resolve } from "node:path";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [swc.vite()],
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./test/setup.ts"],
    include: [
      "test/**/*.{test,spec,e2e-spec}.ts",
      "domain/**/*.spec.ts",
      "src/**/*.spec.ts",
    ],
    env: {
      NODE_ENV: "test",
      DATABASE_URL:
        "postgresql://construgame:construgame_dev_password@localhost:5432/construgame",
      JWT_SECRET: "test_jwt_secret_key_for_testing_only",
      JWT_EXPIRATION: "1d",
      AWS_REGION: "sa-east-1",
      AWS_ACCESS_KEY_ID: "test_access_key",
      AWS_SECRET_ACCESS_KEY: "test_secret_key",
      AWS_S3_BUCKET: "test-bucket",
      AWS_SNS_PLATFORM_ARN_ANDROID:
        "arn:aws:sns:sa-east-1:123456789:app/GCM/test",
      AWS_SNS_PLATFORM_ARN_IOS: "arn:aws:sns:sa-east-1:123456789:app/APNS/test",
      EMAIL_FROM: "noreply@test.construgame.com",
      APP_URL: "http://localhost:3000",
      SMS_SENDER_ID: "ConstrugameTest",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "test/",
        "dist/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData",
      ],
    },
  },
  resolve: {
    alias: {
      "@domain": resolve(__dirname, "./domain"),
      "@infrastructure": resolve(__dirname, "./src/infrastructure"),
      "@modules": resolve(__dirname, "./src/modules"),
      "@common": resolve(__dirname, "./src/common"),
    },
  },
});
