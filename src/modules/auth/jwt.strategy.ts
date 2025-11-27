import { SsmService } from "@infrastructure/services/ssm/ssm.service";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly ssmService: SsmService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Usa secretOrKeyProvider para buscar o secret dinamicamente
      secretOrKeyProvider: async (
        _request: any,
        _rawJwtToken: string,
        done: (err: any, secret?: string) => void,
      ) => {
        try {
          const secret = await ssmService.getJwtSecret();
          done(null, secret);
        } catch (error) {
          done(error);
        }
      },
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      roles: payload.roles,
      userType: payload.userType,
    };
  }
}
