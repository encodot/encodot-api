import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Key extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public key: string;

}
