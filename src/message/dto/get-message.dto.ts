import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class GetMessageDto {

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  public publicKey: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  public keyId: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  public messageId: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  public password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  public urlPassword: string;

}
