import {
  IClientResponse,
  ICreateUserData,
  IUserPublicData,
  OrderStatus,
  UserRole,
} from "@/types";
import Customer from "./customerModel";
import { prisma } from "../../../prisma/prisma";
import bcrypt from "bcryptjs";
import {
  ApprovalOrderSchema,
  GetUsersSchema,
} from "../validators/orders.validator";
import { ZodError } from "zod";
import { formatZodError } from "../utils/zod-error-formatter";

export default class Dispatcher extends Customer {
  static async createUser(data: ICreateUserData): Promise<IUserPublicData> {
    try {
      const { login, email, password } = data;
      if (!login?.trim() || !email?.trim() || !password?.trim()) {
        throw new Error(
          "Обязательные поля login, email, password не заполнены | general",
        );
      }

      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ login: login }, { email: email }],
        },
      });
      if (existing) {
        if (existing.login === login) {
          throw new Error("Login уже зарегестрирован | login");
        }
        if (existing.email === email) {
          throw new Error("Email уже зарегестрирован | email");
        }
      }
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12");
      const hashPassword = await bcrypt.hash(password, saltRounds);

      const user = await prisma.user.create({
        data: {
          login: login,
          email: email,
          passwordHash: hashPassword,
        },
        select: {
          id: true,
          login: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
      return {
        id: user.id,
        login: user.login,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      console.error(
        "Ошибка создания пользователя: ",
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }

  static async approvalOrder(
    orderId: number,
    dispatcherId: number,
    courierId: number,
    role: UserRole,
    currentStatus: OrderStatus,
  ): Promise<IClientResponse> {
    try {
      const validData = ApprovalOrderSchema.parse({
        orderId,
        dispatcherId,
        courierId,
        role,
        currentStatus,
      });
      const res = await prisma.$transaction(async (tx) => {
        const existingOrder = await tx.orders.findUnique({
          where: {
            id: validData.orderId,
            status: validData.currentStatus,
          },
        });
        if (!existingOrder) {
          throw new Error(
            `Заказ не найден или статус изменился. Текущий статус: ${currentStatus}`,
          );
        }
        const updatedOrder = await tx.orders.update({
          where: { id: validData.orderId, status: validData.currentStatus },
          data: {
            status: "AGREED",
            courierId: validData.courierId,
            dispatcherId: validData.dispatcherId,
            approvedAt: new Date(),
            updatedAt: new Date(),
          },
        });

        return updatedOrder;
      });

      return {
        success: true,
        message: "Заказ успешно подтверждён и курьер назначен",
        status: 200,
        order: res,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return formatZodError(error);
      }
      return {
        success: false,
        message: "Внутреняя ошибка сервера | model",
        status: 500,
      };
    }
  }

  static async getUsers(
    requestRole: UserRole,
    responseRole: UserRole,
  ): Promise<IClientResponse> {
    try {
      const validData = GetUsersSchema.parse({ requestRole, responseRole });
      const res = await prisma.user.findMany({
        where: { role: validData.responseRole },
        select: {
          id: true,
          login: true,
          email: true,
          role: true,
        },
      });
      if (!res) {
        return {
          success: false,
          message: "Ошибка получения данных пользователей",
          status: 400,
          users: res,
        };
      }
      if (res.length === 0) {
        return {
          success: false,
          message: "Таких пользователей нет",
          status: 404,
          users: res,
        };
      }
      return {
        success: true,
        message: "Данные успешно предоставленны",
        status: 200,
        users: res,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return formatZodError(error);
      }
      return {
        success: false,
        message: "Внутреняя ошибка сервера | model",
        status: 500,
      };
    }
  }
}
