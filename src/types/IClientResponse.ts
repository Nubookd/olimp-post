import { IUserPublicData } from "./users/IUserPublicData";
import { IOrder } from "./orders/IOrder";

export interface IClientResponse {
  success: boolean;
  message: string;
  status: number;
  errors?: Record<string, string>;
  canRefresh?: boolean | true;
  user?: IUserPublicData;
  users?: IUserPublicData[];
  orders?: IOrder[];
  order?: IOrder;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
