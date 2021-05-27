import { Module } from '@nestjs/common';
import { LoggerModule } from '../../logger/logger.module';
import { AesService } from './aes.service';

@Module({
  providers: [
    AesService
  ],
  exports: [
    AesService
  ],
  imports: [
    LoggerModule
  ]
})
export class AesModule {}
