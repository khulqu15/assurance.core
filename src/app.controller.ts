import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: 'Insurance Approval API is running',
      status: 'ok',
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'insurance-approval-api',
      timestamp: new Date().toISOString(),
    };
  }
}