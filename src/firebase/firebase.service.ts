import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: App;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const serviceAccountPath = this.configService.get<string>(
      'FIREBASE_SERVICE_ACCOUNT_PATH',
    );

    if (!serviceAccountPath) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is not set in .env');
    }

    this.app = initializeApp({
      credential: cert(path.resolve(process.cwd(), serviceAccountPath)),
    });

    console.log('✅ Firebase Admin SDK initialized');
  }

  get auth(): Auth {
    return getAuth(this.app);
  }

  get firestore(): Firestore {
    return getFirestore(this.app);
  }

  get messaging(): Messaging {
    return getMessaging(this.app);
  }
}