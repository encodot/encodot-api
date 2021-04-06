import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { AddMessageDto } from './dto/add-message.dto';
import { GetMessageDto } from './dto/get-message.dto';
import { Key } from './key.entity';
import { MessageService } from './message.service';
import { MessageMetadata } from './models/message-metadata.model';
import { MessageResult } from './models/message-result.model';

@Controller('api/message')
export class MessageController {

  public constructor (
    private messageSv: MessageService
  ) {}

  @Get('key')
  public async getKey(): Promise<Key> {
    return await this.messageSv.getKey();
  }

  @Post('add')
  public async addMessage(@Body(ValidationPipe) addMessageDto: AddMessageDto): Promise<MessageMetadata> {
    return await this.messageSv.addMessage(addMessageDto);
  }

  @Post('get')
  public async getMessage(@Body(ValidationPipe) getMessageDto: GetMessageDto): Promise<MessageResult> {
    return await this.messageSv.getMessage(getMessageDto);
  }

}
