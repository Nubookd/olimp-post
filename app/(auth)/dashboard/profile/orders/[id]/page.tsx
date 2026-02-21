"use client";

import Modal from "@/components/ui/Modal";
import { useUser } from "@/hooks/useUser";
import { IOrder, IOrderItem, IUserPublicData, UserRole } from "@/types";
import { FC, use, useEffect, useState } from "react";
import styles from "./page.module.scss";
import { statusesMap } from "@/types/orders/OrderStatus";
import Button from "@/components/ui/Button";
import { OrderStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import { useAuthContext } from "@/context/AuthContext";
import { useDispatcher } from "@/hooks/useDispatcher";

interface Props {
  children?: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
}

const Order: FC<Props> = ({ params }) => {
  const { user } = useAuthContext();
  const unwrappedParams = use(params);
  const orderId = parseInt(unwrappedParams.id);
  const [couriers, setCouriers] = useState<IUserPublicData[]>([]);
  const { getDetailsOrder, changeOrderStatus } = useUser();
  const { approvalOrder, getUsers } = useDispatcher();
  const [order, setOrder] = useState<IOrder | null>();
  const [error, setError] = useState<string | null>(null);
  const [confirmShowModal, setConfirmShowModal] = useState<boolean>(false);
  const [cancelledShowModal, setCancelledShowModal] = useState<boolean>(false);
  const [shippedShowModal, setShippedShowModal] = useState<boolean>(false);
  const [approvalShowModal, setApprovalShowModal] = useState<boolean>(false);
  const [deliveredShowModal, setDeliveredShowModal] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleCancelledOrder = async (
    orderId: number,
    currentStatus: OrderStatus,
  ) => {
    try {
      setLoading(true);
      const newStatus: OrderStatus = "CANCELLED";
      const res = await changeOrderStatus(orderId, newStatus, currentStatus);
      if (res.success) {
        setConfirmShowModal(false);
        setCancelledShowModal(true);
        setTimeout(() => {
          router.back();
        }, 2000);
      } else {
        setError(res.message);
        setConfirmShowModal(false);
        setCancelledShowModal(false);
      }
    } catch (error) {
      setError("Ошибка отмены заказа");
    } finally {
      setLoading(false);
    }
  };

  const handleShippedOrder = async (
    orderId: number,
    currentStatus: OrderStatus,
  ) => {
    try {
      setLoading(true);
      const newStatus: OrderStatus = "SHIPPED";
      const res = await changeOrderStatus(orderId, newStatus, currentStatus);

      if (res.success) {
        setShippedShowModal(true);
        setTimeout(() => {
          router.back();
        }, 2000);
      } else {
        setError(res.message);
        setShippedShowModal(false);
      }
    } catch (error) {
      setError("Ошибка отгрузки заказа");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalOrder = async (
    orderId: number,
    courierId: number,
    currentStatus: OrderStatus,
  ) => {
    try {
      setLoading(true);
      if (user && (user.role === "DISPATCHER" || user.role === "ADMIN")) {
        const dispatcherId = user.id;
        const res = await approvalOrder(
          orderId,
          courierId,
          dispatcherId,
          currentStatus,
        );
        if (res.success) {
          setApprovalShowModal(true);
          setTimeout(() => {
            router.back();
          }, 2000);
        } else {
          setError(res.message);
          setApprovalShowModal(false);
        }
      } else {
        setError("Не достаточно прав");
      }
    } catch (error) {
      setError("Ошибка подтверждения заказа");
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveredOrder = async (
    orderId: number,
    currentStatus: OrderStatus,
  ) => {
    try {
      setLoading(true);
      const newStatus: OrderStatus = "DELIVERED";
      const res = await changeOrderStatus(orderId, newStatus, currentStatus);
      if (res.success) {
        setDeliveredShowModal(true);
        setTimeout(() => {
          router.back();
        }, 2000);
      } else {
        setError(res.message);
        setDeliveredShowModal(true);
      }
    } catch (error) {
      setError("Ошибка подтверждения заказа");
    } finally {
      setLoading(false);
    }
  };

  const getCourier = async () => {
    try {
      if (user && (user.role === "DISPATCHER" || user.role === "ADMIN")) {
        const requestRole: UserRole = user?.role;
        const responseReole: UserRole = "COURIER";
        const res = await getUsers(requestRole, responseReole);
        if (res.success && res.users) {
          setCouriers(res.users);
        } else {
          setError(res.message);
        }
      } else {
        setError("Не достаточно прав");
      }
    } catch (error) {
      setError("Ошибка получения водителей");
    } finally {
      setLoading(false);
    }
  };

  const getOrderItems = () => {
    if (!order || !order.items) return [];

    const items = order.items;

    if (Array.isArray(items)) {
      return items;
    }

    if (items && typeof items === "object" && "items" in items) {
      return Array.isArray(items.items) ? items.items : [];
    }

    if (typeof items === "string") {
      try {
        const parsed = JSON.parse(items);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  };

  useEffect(() => {
    if (user && (user.role === "ADMIN" || user.role === "DISPATCHER")) {
      getCourier();
    }
    const getDetails = async () => {
      try {
        setLoading(true);
        const res = await getDetailsOrder(orderId);
        if (res.success) {
          setOrder(res.order);
        } else {
          setError(res.message || "Ошибка получения подробностей");
        }
      } catch (error) {
        console.error("Ошибка загрузки заказа:", error);
        setError("Не удалось загрузить данные заказа");
      } finally {
        setLoading(false);
      }
    };
    getDetails();
  }, [orderId, getDetailsOrder]);

  const items: IOrderItem[] = getOrderItems();

  return (
    <>
      {!confirmShowModal &&
        !cancelledShowModal &&
        !shippedShowModal &&
        !approvalShowModal &&
        !deliveredShowModal && (
          <Modal type="action" closeUrl="/dashboard/profile">
            {loading ? (
              <Loader />
            ) : error ? (
              <div>{error}</div>
            ) : (
              order && (
                <div className={styles.details}>
                  <span>Номер заказа: {order.id}</span>
                  <span>
                    Статус: {statusesMap[order.status] || order.status}
                  </span>
                  <span>Итоговая стоимость: {order.totalCost}₽</span>
                  <span>
                    Дата оформления:{" "}
                    {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                  </span>
                  <span>
                    Дата и время отгрузки:{" "}
                    {new Date(order.term).toLocaleString("ru-RU", {
                      year: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <div className={styles.details__items}>
                    <span className={styles["details__items--title"]}>
                      Позиции
                    </span>
                    <table className={styles["details__items--inner"]}>
                      <thead>
                        <tr>
                          <th>Наименование</th>
                          <th>Марка</th>
                          <th>Цена</th>
                          <th>Кол-во</th>
                          <th>Стоимость</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.stamp}</td>
                            <td>{item.price}</td>
                            <td>{item.quantity}</td>
                            <td>
                              {item.quantity && item.price * item.quantity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className={styles.details__action}>
                    {order.status === "PENDING" &&
                      (user?.role === "DISPATCHER" ||
                        user?.role === "ADMIN") && (
                        <div className={styles.action__input}>
                          <select>
                            <option>Выберите водителя</option>
                            {couriers.map((courier) => (
                              <option key={courier.id}>{courier.login}</option>
                            ))}
                          </select>
                          <Button
                            variant="primary"
                            onClick={() =>
                              handleApprovalOrder(order.id, 5, order.status)
                            }
                          >
                            Подтвердить
                          </Button>
                        </div>
                      )}
                    {(order.status === "PENDING" ||
                      order.status === "AGREED") &&
                      user?.role !== "OPERATOR" &&
                      user?.role !== "COURIER" && (
                        <Button
                          variant="secondary"
                          onClick={() => setConfirmShowModal(true)}
                        >
                          Отменить
                        </Button>
                      )}{" "}
                    {order.status === "SHIPPED" && user?.role === "COURIER" && (
                      <Button
                        variant="primary"
                        onClick={() =>
                          handleDeliveredOrder(order.id, order.status)
                        }
                      >
                        Доставлено
                      </Button>
                    )}
                    {order.status === "CANCELLED" && (
                      <span>
                        Отменён -{" "}
                        {new Date(order.updatedAt).toLocaleString("ru-RU", {
                          year: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                    {order.status === "AGREED" && user?.role === "OPERATOR" && (
                      <Button
                        variant="primary"
                        onClick={() =>
                          handleShippedOrder(orderId, order.status)
                        }
                      >
                        Отгрузить
                      </Button>
                    )}
                  </div>
                </div>
              )
            )}
          </Modal>
        )}

      {confirmShowModal && (
        <Modal type="action" closeUrl="/dashboard/profile">
          <div className={styles.action}>
            <span>Вы уверены?</span>
            <span>Отмена не обратима</span>
            <div className={styles["action--confirm"]}>
              <Button
                variant="primary"
                onClick={() => setConfirmShowModal(false)}
              >
                Вернуться
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  order && handleCancelledOrder(order.id, order.status)
                }
                disabled={!order}
              >
                Отменить
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {approvalShowModal && <Modal type="dialog">Заказ подтверждён</Modal>}
      {shippedShowModal && <Modal type="dialog">Заказ отгружен</Modal>}
      {deliveredShowModal && <Modal type="dialog">Заказ доставлен</Modal>}
      {cancelledShowModal && <Modal type="dialog">Заказ отменён</Modal>}
    </>
  );
};

export default Order;
