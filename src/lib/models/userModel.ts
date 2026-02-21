import {
  IClientResponse,
  ILoginUserData,
  IUserPublicData,
  OrderStatus,
  UserRole,
} from "@/types";
import bcrypt from "bcryptjs";
import { prisma } from "../../../prisma/prisma";
import { LoginUserSchema } from "../validators/auth.validator";
import { ZodError } from "zod";
import { MeOrdersSchema } from "../validators/orders.validator";
import { formatZodError } from "@/utils/zod-error-formatter";

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

  static async getDetailsOrder(orderId: number): Promise<IClientResponse> {
    try {
      const res = await prisma.orders.findFirst({
        where: { id: orderId },
        include: {
          customer: {
            select: {
              id: true,
              login: true,
              email: true,
              role: true,
            },
          },
          courier: {
            select: {
              id: true,
              login: true,
            },
          },
          // dispatcher: {
          //   select: {
          //     id: true,
          //     login: true,
          //   },
          // },
        },
      });
      if (!res) {
        return {
          success: false,
          message: "Подробности по заказу не найдены",
          status: 404,
        };
      }

      return {
        success: true,
        message: "Подробности по заказу успешно предоставленны",
        status: 200,
        order: res,
      };
    } catch (error) {
      return {
        success: false,
        message: "Внутренняя ошибка сервера | model",
        status: 500,
      };
    }
  }

  static async checkExistenceOrder(orderId: number): Promise<IClientResponse> {
    try {
      const res = await prisma.orders.findUnique({
        where: { id: orderId },
      });
      if (res) {
        return {
          success: true,
          message: "Заказ найден",
          status: 200,
          order: res,
        };
      }
      return {
        success: false,
        message: "Заказ не найден",
        status: 404,
      };
    } catch (error) {
      return {
        success: false,
        message: "Внутренняя ошибка сервера | model",
        status: 500,
      };
    }
  }

  static async getOrders(
    userId: number,
    role: UserRole,
    status: OrderStatus,
    filters?: {
      page?: number;
    },
  ): Promise<IClientResponse> {
    try {
      const validData = MeOrdersSchema.parse({ userId, role, status, filters });
      const page = validData.filters?.page || 1;
      const limit = 20;
      const skip = (page - 1) * limit;
      const whereCondition = {} as {
        customerId?: number;
        courierId?: number;
        status: OrderStatus;
      };

      switch (validData.role) {
        case "CUSTOMER":
          whereCondition.customerId = validData.userId;
          whereCondition.status = validData.status;
          break;
        case "COURIER":
          whereCondition.courierId = validData.userId;
          whereCondition.status = validData.status;
          break;
        case "OPERATOR":
          whereCondition.status = validData.status;
          break;
        case "DISPATCHER":
        case "ADMIN":
          if (validData.status) {
            whereCondition.status = validData.status;
          }
          break;
        default:
          return {
            success: false,
            message: `Роль ${validData.role} не поддерживается`,
            status: 400,
          };
      }

      const [orders, total] = await Promise.all([
        prisma.orders.findMany({
          where: whereCondition,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            customer: {
              select: {
                id: true,
                login: true,
                email: true,
                role: true,
              },
            },
            courier: {
              select: {
                id: true,
                login: true,
              },
            },
            // dispatcher: {
            //   select: {
            //     id: true,
            //     login: true,
            //   },
            // },
          },
        }),
        prisma.orders.count({
          where: whereCondition,
        }),
      ]);

      const totalPages = Math.ceil(total / limit);
      return {
        success: true,
        orders: orders || [],
        message:
          orders.length > 0
            ? `Найдено заказов: ${orders.length}`
            : "Заказов не найдено",
        status: 200,
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return formatZodError(error);
      }
      return {
        success: false,
        orders: [],
        message: "Внутренняя ошибка сервера | model",
        status: 500,
      };
    }
  }
}
