import React, { FC } from "react";
import styles from "./OrderSection.module.scss";
import Link from "next/link";
import { IOrder } from "@/types";
import OrderPrevCard from "../OrderPrevCard";

interface OrderSectionProps {
  orders: IOrder[];
}

const OrderSection: FC<OrderSectionProps> = ({ orders }) => (
  <div className={styles.orders__inner}>
    <h2 className={styles.order__subtitle}>
      На этой странице ({orders.length}) заказов
    </h2>
    {orders.map((order, index) => (
      <Link
        key={order.id}
        scroll={false}
        href={`/dashboard/profile/orders/${order.id}`}
      >
        <OrderPrevCard order={order} index={index} />
      </Link>
    ))}
  </div>
);

export default OrderSection;
