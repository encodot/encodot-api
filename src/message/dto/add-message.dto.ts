import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddMessageDto {

  @IsUUID(4)
  public keyId: string;

  @IsNotEmpty()
  @IsString()
  public message: string;

  @IsOptional()
  @IsString()
  public password: string;

}
