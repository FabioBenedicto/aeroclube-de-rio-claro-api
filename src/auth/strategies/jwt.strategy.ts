import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import { jwtConfig } from '../../config/jwt.config';
import { UsersRepository } from '../../users/users.repository';

export interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY) config: ConfigType<typeof jwtConfig>,
    private readonly usersRepository: UsersRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    const { password, permissions, ...safeUser } = user;

    return {
      ...safeUser,
      permissions: permissions.map((p) => p.permission),
    };
  }
}
