import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.prisma_olimp_PRISMA_DATABASE_URL!;

if (!connectionString) {
  throw new Error("prisma_olimp_PRISMA_DATABASE_URL is not defined in .env file");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["query", "error", "warn"],
});

async function main() {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.orders.deleteMany();
  await prisma.$executeRaw`ALTER SEQUENCE "refreshTokens_id_seq" RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE "users_id_seq" RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE "products_id_seq" RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE "orders_id_seq" RESTART WITH 1`;

  const product = await prisma.product.createMany({
    data: [
      {
        name: "БСТ B7,5 П4 F50 W2",
        class: "B7,5",
        stamp: "M100",
        price: 4690,
      },
      {
        name: "БСТ B12,5 П4 F75 W2",
        class: "B10",
        stamp: "M150",
        price: 4790,
      },
      {
        name: "БСТ B15 П4 F150 W6",
        class: "B15",
        stamp: "M200",
        price: 5070,
      },
      {
        name: "БСТ B20 П4 F150 W6",
        class: "B20",
        stamp: "M250",
        price: 5270,
      },
    ],
  });
  const users = await prisma.user.createMany({
    data: [
      {
        login: "admin-post",
        email: "admin@admin.admin",
        passwordHash:
          "$2b$12$uhjHw1MbiJJ5h.WZe3Niv.BgFcOjYFbhJm346FsQfYZk0zadCmWQq",
        role: Role.ADMIN,
      },
      {
        login: "customer",
        email: "customer@customer.customer",
        passwordHash:
          "$2b$12$X8senc9aNwj/eFazKiS3UenQVAkoTNR4SkwIphuBcD/LJjknEIzNO",
        role: Role.CUSTOMER,
      },
      {
        login: "dispatcher",
        email: "dispatcher@dispatcher.dispatcher",
        passwordHash:
          "$2b$12$j1bTWpO.vTPGVoOst5sAdOFh0oaXGIexGrzpx/iAbB8.fA/BmSYwi",
        role: Role.DISPATCHER,
      },
      {
        login: "operator",
        email: "operator@operator.operator",
        passwordHash:
          "$2b$12$PKUK9JHCehyd8Js7HmRQYu7PXsVctXlVtnIjQ85XICv1cn.DmFd6O",
        role: Role.OPERATOR,
      },
      {
        login: "courier",
        email: "courier@courier.courier",
        passwordHash:
          "$2b$12$vb0amORLSwfW2MthCHPuKOz/mb1UFCwErM50E51s4U8GFljujri36",
        role: Role.COURIER,
      },
      {
        login: "courier1",
        email: "courier1@courier1.courier1",
        passwordHash:
          "$2b$10$Amhpue55le/qw4kHaPHIkeCPs9/dVISjs09k9pfi//lgGjeRB5y9q",
        role: Role.COURIER,
      },
      {
        login: "courier2",
        email: "courier2@courier2.courier2",
        passwordHash:
          "$2b$10$OG8lthb3UxDxlwqS.lEMS.LJkPuKaTpJgNHuEyP6rKt48A4ZjRCVK",
        role: Role.COURIER,
      },
    ],
  });
  const orders = await prisma.orders.createMany({
    data: [
      {
        customerId: 2,
        items: {
          items: [
            {
              itemId: 3,
              name: "БСТ B7,5 П4 F50 W2",
              quantity: 1,
              class: "B10",
              stamp: "M100",
              price: 2000,
            },
            {
              itemId: 3,
              name: "БСТ B12,5 П4 F75 W2",
              quantity: 1,
              class: "B10",
              stamp: "M100",
              price: 2000,
            },
            {
              itemId: 3,
              name: "БСТ B15 П4 F150 W6",
              quantity: 1,
              class: "B10",
              stamp: "M100",
              price: 2000,
            },
          ],
        },
        courierId: 5,
        deliveryAddress: "POST",
        totalCost: 2000,
        term: new Date("2026-01-30"),
        status: "CANCELLED",
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error("❌ Ошибка:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
