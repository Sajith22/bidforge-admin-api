import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Sends a real FCM push (if the user has a saved token) AND writes a
   * Firestore /notifications doc, matching exactly what your Flutter app's
   * NotificationService already reads for the in-app bell/badge.
   */
  async notifyUser(
    userId: string,
    title: string,
    body: string,
    productId?: string,
  ): Promise<void> {
    // 1. Always write the Firestore record — this drives the in-app
    //    bell/badge regardless of whether a push actually goes through
    await this.firebaseService.firestore.collection('notifications').add({
      userId,
      title,
      body,
      productId: productId ?? null,
      isRead: false,
      timestamp: new Date().toISOString(),
    });

    // 2. Look up the user's FCM token to attempt a real push
    const userDoc = await this.firebaseService.firestore
      .collection('users')
      .doc(userId)
      .get();

    const fcmToken = userDoc.data()?.fcmToken;

    if (!fcmToken) {
      this.logger.warn(
        `No FCM token for user ${userId} — in-app notification saved, but no push sent`,
      );
      return;
    }

    try {
      await this.firebaseService.messaging.send({
        token: fcmToken,
        notification: { title, body },
        data: productId ? { productId } : {},
      });
      this.logger.log(`Push notification sent to user ${userId}`);
    } catch (error) {
      // Never let a bad/expired token crash the auction-closing flow —
      // log it and move on. The Firestore record above already succeeded.
      this.logger.error(`Failed to send push to ${userId}: ${error.message}`);
    }
  }
}