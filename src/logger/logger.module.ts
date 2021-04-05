import { Module } from '@nestjs/common';
import { ApiLogger } from './api-logger';

@Module({
  providers: [
    ApiLogger
  ],
  exports: [
    ApiLogger
  ]
})
export class LoggerModule {}
