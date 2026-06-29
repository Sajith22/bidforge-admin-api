import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';

@Module({
  providers: [AuctionsService],
})
export class AuctionsModule {}