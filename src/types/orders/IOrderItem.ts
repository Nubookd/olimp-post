export interface IOrderItem {
  id: number;
  name: string;
  class: string;
  stamp: string;
  price: number;
  quantity?: number;
  total?: number;
}
