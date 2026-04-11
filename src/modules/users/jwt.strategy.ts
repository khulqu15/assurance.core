import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from './users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET ?? 'supersecretjwtkey',
        });
    }

    async validate(payload: { sub: string; email: string; roles: string[] }) {
        const user = await this.usersService.findByIdWithRoles(payload.sub);
        return {
            sub: user.id,
            email: user.email,
            fullName: user.fullName,
            roles: user.userRoles.map((item) => item.role.code),
        };
  }
}