import * as moment from 'moment';
import { EntityRepository, LessThan, Repository } from 'typeorm';
import { Key } from './key.entity';

@EntityRepository(Key)
export class KeyRepository extends Repository<Key> {

  public async saveKey(key: string): Promise<Key> {
    const keyEntity = new Key();
    keyEntity.key = key;

    return await keyEntity.save();
  }

  public async getKey(id: string): Promise<Key> {
    return await this.findOne({ id });
  }

  public async deleteExpired(maxAgeSeconds: number): Promise<number> {
    const minDate = moment().utcOffset(0);
    minDate.subtract(maxAgeSeconds, 'seconds');

    const deleteResult = await this.delete({
      created: LessThan(minDate)
    });

    return deleteResult.affected ?? 0;
  }

}
