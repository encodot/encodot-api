import { BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm';

export class Key extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public key: string;

}
