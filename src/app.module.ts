import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from './typeorm-config';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormConfig),
    MessageModule
  ]
})
export class AppModule {}
