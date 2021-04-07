import { Module } from '@nestjs/common';
import { AesService } from './aes.service';

@Module({
  providers: [
    AesService
  ],
  exports: [
    AesService
  ]
})
export class AesModule {}
