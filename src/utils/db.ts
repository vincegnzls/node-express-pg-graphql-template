import { DataSource } from "typeorm"
import { User } from "../entities/User"
import "dotenv-safe/config"

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: 5432,
  entities: [User],
  synchronize: true,
  logging: process.env.NODE_ENV === "development",
})
