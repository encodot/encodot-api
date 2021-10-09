import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { AddMessageDto } from './dto/add-message.dto';
import { GetMessageDto } from './dto/get-message.dto';
import { GetTransactionKeyDto } from './dto/get-transaction-key.dto';
import { MessageService } from './message.service';
import { Key } from './models/key.model';
import { MessageMetadata } from './models/message-metadata.model';
import { MessageResult } from './models/message-result.model';

@Controller('api/message')
export class MessageController {

  public constructor (
    private messageSv: MessageService
  ) {}

  @Get('transaction-key')
  public async getTransactionKey(@Body(ValidationPipe) dto: GetTransactionKeyDto): Promise<Key> {
    return await this.messageSv.getTransactionKey(dto);
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
