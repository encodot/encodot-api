import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Key extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public key: string;

  @CreateDateColumn()
  public created: Date;

}
