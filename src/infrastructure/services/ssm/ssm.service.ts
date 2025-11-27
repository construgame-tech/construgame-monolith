import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SsmService implements OnModuleInit {
  private readonly logger = new Logger(SsmService.name);
  private readonly client: SSMClient;
  private jwtSecret: string | undefined;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>("AWS_REGION") || "sa-east-1";
    const accessKeyId = this.configService.get<string>("AWS_ACCESS_KEY_ID");
    const secretAccessKey = this.configService.get<string>(
      "AWS_SECRET_ACCESS_KEY",
    );

    this.client = new SSMClient({
      region,
      credentials:
        accessKeyId && secretAccessKey
          ? { accessKeyId, secretAccessKey }
          : undefined,
    });
  }

  async onModuleInit() {
    // Pré-carrega o JWT secret na inicialização se estiver em produção
    const nodeEnv = this.configService.get<string>("NODE_ENV");
    if (nodeEnv === "production") {
      try {
        await this.getJwtSecret();
        this.logger.log("JWT secret loaded from SSM on startup");
      } catch (error) {
        this.logger.warn(
          "Failed to load JWT secret from SSM on startup, will retry on first use",
        );
      }
    }
  }

  /**
   * Busca o JWT secret do SSM Parameter Store
   * Em desenvolvimento, usa a variável de ambiente JWT_SECRET
   */
  async getJwtSecret(): Promise<string> {
    // Em desenvolvimento, usa a variável de ambiente
    const nodeEnv = this.configService.get<string>("NODE_ENV");
    if (nodeEnv !== "production") {
      const envSecret = this.configService.get<string>("JWT_SECRET");
      if (envSecret) {
        return envSecret;
      }
    }

    // Retorna cache se já carregado
    if (this.jwtSecret) {
      return this.jwtSecret;
    }

    // Busca do SSM
    try {
      const parameterName =
        this.configService.get<string>("JWT_SECRET_SSM_PARAMETER") ||
        "jwt-secret";
      const response = await this.client.send(
        new GetParameterCommand({
          Name: parameterName,
          WithDecryption: true,
        }),
      );

      this.jwtSecret = response.Parameter?.Value;

      if (!this.jwtSecret) {
        throw new Error("JWT secret parameter is empty");
      }

      this.logger.log("JWT secret loaded from SSM Parameter Store");
      return this.jwtSecret;
    } catch (error) {
      this.logger.error("Failed to load JWT secret from SSM:", error);

      // Fallback para variável de ambiente
      const envSecret = this.configService.get<string>("JWT_SECRET");
      if (envSecret) {
        this.logger.warn("Using JWT_SECRET from environment as fallback");
        return envSecret;
      }

      throw new Error("Could not load JWT secret from SSM or environment");
    }
  }

  /**
   * Busca um parâmetro genérico do SSM
   */
  async getParameter(name: string, decrypt = true): Promise<string | null> {
    try {
      const response = await this.client.send(
        new GetParameterCommand({
          Name: name,
          WithDecryption: decrypt,
        }),
      );

      return response.Parameter?.Value || null;
    } catch (error) {
      this.logger.error(`Failed to load parameter ${name} from SSM:`, error);
      return null;
    }
  }
}
