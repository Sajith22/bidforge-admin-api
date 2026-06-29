import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { FirebaseAuthGuard } from './auth/firebase-auth.guard';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('admin-test')
  @UseGuards(FirebaseAuthGuard)
  testAdminRoute() {
    return { message: 'You are verified as admin!' };
  }
}
