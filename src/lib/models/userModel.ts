import {
  ILoginUserData,
  IUserPublicData,
} from "@/types";
import bcrypt from "bcryptjs";
import { prisma } from "../../../prisma/prisma";
import { LoginUserSchema } from "../validators/auth.validator";
import { ZodError } from "zod";

export default class User {
  static async loginUser(data: ILoginUserData): Promise<IUserPublicData> {
    try {
      const validData = LoginUserSchema.parse(data);
      const { login, password } = validData;

      const user = await prisma.user.findFirst({
        where: {
          login: login,
        },
      });

      if (!user) {
        throw new Error("Пользователь не найден | general");
      }
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error("Неверный пароль | password");
      }
      return {
        id: user.id,
        login: user.login,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.issues[0]?.message || "Ошибка валидации";
        throw new Error(`${firstError} | validation`);
      }
      console.error(
        "Ошибка входа: ",
        error instanceof Error ? error.message : error,
      );

      throw error;
    }
  }

  static async findMe(userId: number): Promise<IUserPublicData> {
    try {
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw new Error("Пользователь не найден | general");
      }
      return {
        id: user.id,
        login: user.login,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      console.error(
        "Ошибка аутентификации: ",
        error instanceof Error ? error.message : error,
      );

      throw error;
    }
  }

}
