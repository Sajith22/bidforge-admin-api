import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('test-send')
  async testSend(@Body('userId') userId: string) {
    await this.notificationsService.notifyUser(
      userId,
      'Test Notification',
      'This is a test push from the NestJS admin API.',
    );
    return { message: `Notification flow ran for user ${userId}` };
  }
}