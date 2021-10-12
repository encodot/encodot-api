import { Module } from '@nestjs/common';
import { LoggerModule } from '../../logger/logger.module';
import { Base64Service } from './base64.service';

@Module({
  providers: [
    Base64Service
  ],
  exports: [
    Base64Service
  ],
  imports: [
    LoggerModule
  ]
})
export class Base64Module {}
