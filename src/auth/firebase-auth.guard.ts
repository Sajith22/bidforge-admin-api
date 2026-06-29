import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization header');
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await this.firebaseService.auth.verifyIdToken(idToken);

      if (decodedToken.role !== 'admin') {
        throw new ForbiddenException('Admin access required');
      }

      // Make the verified user available to controllers via request.user
      (request as any).user = decodedToken;

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}