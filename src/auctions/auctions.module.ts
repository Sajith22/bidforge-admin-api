import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [AuctionsService],
})
export class AuctionsModule {}