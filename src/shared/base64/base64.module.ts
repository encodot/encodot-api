import { Module } from '@nestjs/common';
import { Base64Service } from './base64.service';

@Module({
  providers: [
    Base64Service
  ],
  exports: [
    Base64Service
  ]
})
export class Base64Module {}
