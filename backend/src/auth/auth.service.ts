import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { prisma } from 'lib/prisma';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private auditService: AuditService,
  ) { }

  generateToken(userId: any) {
    return this.jwtService.sign({ id: userId });
  }

  async signup(createAuthDto: CreateAuthDto) {
    const { firstName, lastName, email, password } = createAuthDto;

    const findUser = await prisma.user.findUnique({
      where: { email },
    });
    if (findUser) {
      throw new BadRequestException({ message: 'User already exist' });
    }

    try {
      const hashedPassword = await argon.hash(password);
      const newUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role: email === 'admin7575@gmail.com' ? 'ADMIN' : 'USER',
        },
      });

      const token = this.generateToken(newUser.id);

      // Save session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 15);
      await prisma.session.create({
        data: {
          userId: newUser.id,
          token,
          expiresAt,
        },
      });

      // Audit log
      await this.auditService.logAction(newUser.id, 'USER_SIGNUP', { email });

      return { user: newUser, token };
    } catch (error) {
      console.error((error as Error)?.message);
      throw new InternalServerErrorException(
        'Error in creating user ==> ' + (error as Error)?.message,
      );
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon.verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id);

    // Save session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 15);
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Audit log
    await this.auditService.logAction(user.id, 'USER_LOGIN', { email });

    return { user, token };
  }

  async checkAuth(userId: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
