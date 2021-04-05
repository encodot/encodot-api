import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from './typeorm-config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormConfig),
  ]
})
export class AppModule {}
