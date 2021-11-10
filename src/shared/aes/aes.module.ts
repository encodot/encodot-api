import { Module } from '@nestjs/common';
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
    Base64Module
  ]
})
export class AesModule {}
