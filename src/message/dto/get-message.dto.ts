import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class GetMessageDto {

  @IsNotEmpty()
  @IsNumber()
  public keyId: number;

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
