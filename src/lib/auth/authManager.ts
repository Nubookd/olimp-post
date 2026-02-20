import { ILoginUserData, IRefreshTokenPayload, IClientResponse } from "@/types";
import User from "../models/userModel";
import AuthService from "./authService";
import { clearTokens, getTokens, setTokens } from "./authCookie";
import { decodeJwt } from "jose";
import { LoginUserSchema } from "../validators/auth.validator";
import { ZodError } from "zod";
import { formatZodError } from "../utils/zod-error-formatter";

export default class Auth {
  static async login(userData: ILoginUserData): Promise<IClientResponse> {
    try {
      const validData = LoginUserSchema.parse(userData);

      const user = await User.loginUser(validData);
      const accessToken = await AuthService.generateAccessToken(user);
      const refreshToken = await AuthService.generateRefreshToken(user.id);
      await setTokens(accessToken, refreshToken);

      return {
        success: true,
        message: "Успешный вход",
        user,
        status: 200,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return formatZodError(error);
      }
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка входа";
      let statusCode = 500;
      if (
        errorMessage.includes("не найден") ||
        errorMessage.includes("Неверный пароль")
      ) {
        statusCode = 401;
      }

      return {
        success: false,
        message: errorMessage,
        status: statusCode,
      };
    }
  }

  static async logout(): Promise<IClientResponse> {
    try {
      const tokens = await getTokens();
      if (!tokens.refreshToken) {
        await clearTokens();
        return {
          success: true,
          message: "Refresh token не найден, но cookies очищены",
          status: 200,
        };
      }

      const decoded = decodeJwt(tokens.refreshToken);
      if (!decoded) {
        await clearTokens();
        return {
          success: true,
          message: "Невалидный refresh token, cookies очищены",
          status: 200,
        };
      }
      const plainToken = (decoded as IRefreshTokenPayload).token;

      if (plainToken && typeof plainToken === "string") {
        await AuthService.invalidateRefreshToken(plainToken);
      }

      await clearTokens();
      return {
        success: true,
        message: "Успешный выход из системы",
        status: 200,
      };
    } catch (error) {
      console.error("Ошибка при выходе: ", error);
      try {
        await clearTokens();
      } catch (clearError) {
        console.error("Ошибка при очистке cookies:", clearError);
      }
      return {
        success: false,
        message: error instanceof Error ? error.message : "Ошибка выхода",
        status: 500,
      };
    }
  }

  static async findMe(): Promise<IClientResponse> {
    try {
      const isAuth = await this.checkAuth();
      return isAuth;
    } catch (error) {
      return {
        success: false,
        message: "Пользователь не аутентифицирован",
        status: 500,
      };
    }
  }

  static async checkAuth(): Promise<IClientResponse> {
    try {
      const { accessToken, refreshToken } = await getTokens();
      if (accessToken) {
        const user = await AuthService.verifyAccessToken(accessToken);
        if (user) {
          return {
            success: true,
            message: "Пользователь аутентифицирован",
            user,
            status: 200,
          };
        }
      }
      if (refreshToken) {
        const isValidRefresh =
          await AuthService.verifyRefreshToken(refreshToken);
        if (isValidRefresh) {
          const newTokens = await AuthService.refreshTokens(refreshToken);

          if (newTokens) {
            await setTokens(newTokens.accessToken, newTokens.refreshToken);
            const user = await AuthService.verifyAccessToken(
              newTokens.accessToken,
            );
            if (user) {
              return {
                success: true,
                message: "Пользователь аутентифицирован",
                user,
                status: 200,
              };
            }
          }
        }
      }
      await clearTokens();
      return {
        success: false,
        message: "Требуется аутентификация",
        status: 401,
        canRefresh: false,
      };
    } catch (error) {
      return {
        success: false,
        message: "Внутренняя ошибка сервера | service",
        status: 500,
      };
    }
  }
}
