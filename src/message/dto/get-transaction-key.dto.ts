import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class GetTransactionKeyDto {

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  public publicKey: string;

}
