import * as moment from 'moment';
import { EntityRepository, LessThan, Repository } from 'typeorm';
import { Message } from './message.entity';

@EntityRepository(Message)
export class MessageRepository extends Repository<Message> {

  public async addMessage(message: string): Promise<Message> {
    const msg = new Message();
    msg.message = message;

    return await msg.save();
  }

  public async getMessage(id: string): Promise<Message> {
    return await this.findOne({ id });
  }

  public async deleteMessage(id: string): Promise<void> {
    await this.delete({ id });
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
