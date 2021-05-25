import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';
import { Message } from './message/message.entity';

const {
  host,
  port,
  database,
  username,
  password,
  synchronize
} = config.get('db');

export const typeormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host,
  port,
  database,
  username,
  password,
  entities: [
    Message
  ],
  synchronize
};
