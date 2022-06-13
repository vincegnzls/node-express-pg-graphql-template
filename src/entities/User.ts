import { Field, ID, ObjectType } from "type-graphql"
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  userId!: number

  @Field(() => String)
  @Column("text")
  firstName!: string

  @Field(() => String)
  @Column("text")
  lastName!: string

  @Field(() => String)
  @Column("text", { unique: true })
  username!: string

  @Column("text")
  password!: string
}
