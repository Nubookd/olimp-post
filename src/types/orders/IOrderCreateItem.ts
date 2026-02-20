import { JsonValue } from "@prisma/client/runtime/client";
import { IOrderItem } from "./IOrderItem";
import { OrderStatus } from "./OrderStatus";

export interface IOrderCreateItem {
  customerId: number;
  items: IOrderItem[] | JsonValue | null;
  totalCost: number;
  term: Date;
  status: OrderStatus;
  deliveryAddress: string;
  deliveryLat?: number | null;
  deliveryLon?: number | null;
}
