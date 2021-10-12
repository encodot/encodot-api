import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class AddMessageDto {

  @IsNotEmpty()
  @IsNumber()
  public keyId: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  public message: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  public password: string;

}
