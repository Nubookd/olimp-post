import React, { FC } from "react";
import styles from "./OrdersHeader.module.scss";
import { OrderStatus, statuses } from "@/types/orders/OrderStatus";
import Button from "@/components/ui/Button";
import { useAuthContext } from "@/context/AuthContext";
import { ORDER_STATUS_CAN_VISIBLE } from "@/lib/auth/permissions/role";

interface Props {
  activeStatus: OrderStatus;
  onChangeStatus: (status: OrderStatus) => void;
}

const OrdersHeader: FC<Props> = ({ activeStatus, onChangeStatus }) => {
  const { user } = useAuthContext();

  const visibleStatuses =
    ORDER_STATUS_CAN_VISIBLE[
      user?.role as keyof typeof ORDER_STATUS_CAN_VISIBLE
    ] || ORDER_STATUS_CAN_VISIBLE.CUSTOMER;

  const filteredStatuses = statuses.filter((status) =>
    visibleStatuses.includes(status.value),
  );
  return (
    <div className={styles.orders__header}>
      {filteredStatuses.map((status) => (
        <Button
          key={status.value}
          variant={activeStatus === status.value ? "primary" : "secondary"}
          onClick={() => onChangeStatus(status.value)}
          className={
            activeStatus !== status.value
              ? styles["orders__header--button"]
              : ""
          }
        >
          <strong>{status.label}</strong>
        </Button>
      ))}
    </div>
  );
};

export default OrdersHeader;
