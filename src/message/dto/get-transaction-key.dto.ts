import { IsNotEmpty, IsString } from 'class-validator';

export class GetTransactionKeyDto {

  @IsNotEmpty()
  @IsString()
  public publicKey: string;

}
