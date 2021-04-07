import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';
import { Key } from './message/key.entity';
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
    Message,
    Key
  ],
  synchronize
};
