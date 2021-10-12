import { Module } from '@nestjs/common';
import { LoggerModule } from '../../logger/logger.module';
import { Base64Module } from '../base64/base64.module';
import { AesService } from './aes.service';

@Module({
  providers: [
    AesService
  ],
  exports: [
    AesService
  ],
  imports: [
    LoggerModule,
    Base64Module
  ]
})
export class AesModule {}
