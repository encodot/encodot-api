import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message extends BaseEntity {

  // TODO(): Check if the id should be generated safly with a crypto library.
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public message: string;

  @CreateDateColumn()
  public created: Date;

}
