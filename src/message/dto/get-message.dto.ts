import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class GetMessageDto {

  @IsUUID(4)
  public keyId: string;

  @IsNotEmpty()
  @IsString()
  public messageId: string;

  @IsOptional()
  @IsString()
  public password: string;

  @IsNotEmpty()
  @IsString()
  public urlPassword: string;

}
