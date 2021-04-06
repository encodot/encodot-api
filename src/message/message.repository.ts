import { EntityRepository, Repository } from 'typeorm';
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

}
