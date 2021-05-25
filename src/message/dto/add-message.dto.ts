import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AddMessageDto {

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  public message: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  public password: string;

}
