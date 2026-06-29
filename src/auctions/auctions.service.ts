import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FirebaseService } from '../firebase/firebase.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuctionsService {
  private readonly logger = new Logger(AuctionsService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async closeExpiredAuctions() {
    const db = this.firebaseService.firestore;
    const now = Date.now();

    const snapshot = await db
      .collection('products')
      .where('isPublished', '==', true)
      .get();

    let closedCount = 0;

    for (const doc of snapshot.docs) {
      const product = doc.data();

      if (product.winnerId || product.endedAt) continue;

      const start = new Date(product.startTime).getTime();
      const end = start + product.durationMinutes * 60 * 1000;

      if (now > end) {
        const hasWinner = !!product.highestBidderId;

        await doc.ref.update({
          endedAt: new Date().toISOString(),
          winnerId: hasWinner ? product.highestBidderId : null,
          winnerName: hasWinner ? product.highestBidderName : null,
          winningBid: hasWinner ? product.currentHighestBid : null,
        });

        closedCount++;
        this.logger.log(
          `Closed auction "${product.title}" (${doc.id}) — winner: ${
            hasWinner ? product.highestBidderName : 'none'
          }`,
        );

        // ← this is the line that was a placeholder before
        if (hasWinner) {
          await this.notificationsService.notifyUser(
            product.highestBidderId,
            '🏆 You Won!',
            `Congratulations! Your bid of $${product.currentHighestBid} won "${product.title}".`,
            doc.id,
          );
        }
      }
    }

    if (closedCount > 0) {
      this.logger.log(`Closed ${closedCount} expired auction(s)`);
    }
  }
}