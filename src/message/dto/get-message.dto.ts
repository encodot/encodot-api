import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class GetMessageDto {

  @IsUUID(4)
  public keyId: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  public messageId: string;

  @IsString()
  public password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  public urlPassword: string;

}
