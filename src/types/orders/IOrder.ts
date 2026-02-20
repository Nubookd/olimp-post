import { IUserPublicData } from "../users/IUserPublicData";
import { IOrderCreateItem } from "./IOrderCreateItem";

export interface IOrder extends IOrderCreateItem {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  customer?: IUserPublicData;
}
