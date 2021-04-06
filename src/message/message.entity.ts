import { BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm';

export class Message extends BaseEntity {

  // TODO(): Check if the id should be generated safly with a crypto library.
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public message: string;

}
