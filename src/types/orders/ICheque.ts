import { IOrderItem } from "./IOrderItem";

export interface ICheque {
  items: IOrderItem[];
  totalCost: number;
  term: Date;
  deliveryAddress?: string;
  deliveryLat?: number;
  deliveryLon?: number;
}
