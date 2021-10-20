import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class AddMessageDto {

  @IsUUID(4)
  public keyId: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  public message: string;

  @IsString()
  public password: string;

}
