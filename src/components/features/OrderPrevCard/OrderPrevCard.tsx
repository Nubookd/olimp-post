import React, { FC } from "react";
import styles from "./OrderPrevCard.module.scss";
import { IOrder } from "@/types";
import { statusesMap } from "@/types/orders/OrderStatus";
import { useAuthContext } from "@/context/AuthContext";

interface Props {
  children?: React.ReactNode;
  order: IOrder;
  index: number;
}

const OrderPrevCard: FC<Props> = ({ children, order, index }) => {
  const { user } = useAuthContext();
  
  return (
    <div className={styles.order}>
      <h3 className={styles.order__title}>Заказ: {index + 1}</h3>
      {order &&
      user &&
      (user.role === "DISPATCHER" || user.role === "ADMIN") &&
      order &&
      order.customer ? (
        <div className={styles["order__inner--admin"]}>
          <h4 className={styles["order__item--admin"]}>
            Заказчик: {order.customer.login}
          </h4>
          <h4 className={styles["order__item--admin"]}>
            Доставка до: {new Date(order.term).toLocaleDateString("ru-RU")}
          </h4>
          <h4 className={styles["order__item--admin"]}>
            Статус: {statusesMap[order.status] || order.status}
          </h4>
        </div>
      ) : (
        <div className={styles.order__inner}>
          <h4 className={styles.order__item}>Номер: {order.id}</h4>
          <h4 className={styles.order__item}>
            От: {new Date(order.createdAt).toLocaleDateString("ru-RU")}
          </h4>
          <h4 className={styles.order__item}>
            Срок доставки до: {new Date(order.term).toLocaleDateString("ru-RU")}
          </h4>
          <h4 className={styles.order__item}>
            Статус: {statusesMap[order.status] || order.status}
          </h4>
        </div>
      )}
    </div>
  );
};

export default OrderPrevCard;
