"use client";

import { useUser } from "@/hooks/useUser";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import styles from "./Orders.module.scss";
import Link from "next/link";
import OrderSection from "@/components/features/OrderSection";
import { OrderStatus } from "@/types";
import OrdersHeader from "@/components/features/OrdersHeader";
import OrdersPagination from "@/components/features/OrdersPagination";
import Button from "@/components/ui/Button";
import { statusesMap } from "@/types/orders/OrderStatus";
import { useAuthContext } from "@/context/AuthContext";
import { ROLE_DEFAULT_STATUS } from "@/lib/auth/permissions/role";
import Loader from "@/components/ui/Loader";
interface Props {
  children?: React.ReactNode;
}

const Orders: FC<Props> = () => {
  const { loading, error, orders, getOrders } = useUser();
  const { user } = useAuthContext();
  const defaultStatus = useMemo(() => {
    const role = user?.role || "CUSTOMER";
    return ROLE_DEFAULT_STATUS[role] || "PENDING";
  }, [user?.role]);
  const [activeStatus, setActiveStatus] = useState<OrderStatus>(defaultStatus);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [totalPage, setTotalPage] = useState<number>(1);

  const getOrdersByStatus = useCallback(
    async (status: OrderStatus, currentPage: number) => {
      try {
        const res = await getOrders(status, currentPage);
        if (res.meta?.page) setPage(res.meta.page);
        if (res.meta?.total) setTotal(res.meta.total);
        if (res.meta?.totalPages) setTotalPage(res.meta.totalPages);
      } catch (error) {
      } finally {
      }
    },
    [getOrders],
  );

  const onChangeStatus = (status: OrderStatus) => {
    setActiveStatus(status);
    setPage(0);
    setTotal(0);
    setTotalPage(0);
    getOrdersByStatus(status, 1);
  };

  const handlePaginationNext = () => {
    if (page < totalPage) {
      setPage((prev) => prev + 1);
    }
  };
  const handlePaginationPrev = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  useEffect(() => {
    getOrdersByStatus(activeStatus, page);
  }, [getOrdersByStatus, activeStatus, page]);

  return (
    <div className={styles.orders}>
      <OrdersHeader
        activeStatus={activeStatus}
        onChangeStatus={onChangeStatus}
      />
      <h2 className={styles.orders__title}>
        {statusesMap[activeStatus]} ({total})
      </h2>

      <div className={styles.orders__inners}>
        <OrdersPagination
          handlePaginationNext={handlePaginationNext}
          handlePaginationPrev={handlePaginationPrev}
          page={page}
          totalPage={totalPage}
          loading={loading.orders}
        />
        {loading.orders ? (
          <Loader />
        ) : orders.length > 0 ? (
          <OrderSection orders={orders} />
        ) : (
          <div className={styles.empty}>
            <span>Заказов пока нет</span>
            <Button variant="primary">
              <Link href="/" className={styles.catalogLink}>
                Перейти в каталог
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
