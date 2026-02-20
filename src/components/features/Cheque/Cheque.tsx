"use client";

import { ICheque } from "@/types";
import styles from "./Cheque.module.scss";
import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { useUser } from "@/hooks/useUser";
import Modal from "@/components/ui/Modal";
import { useRouter } from "next/navigation";
import { ChequeSchema } from "@/lib/validators/orders.validator";
import { formatZodError } from "@/lib/utils/zod-error-formatter";

interface Props {
  order: ICheque;
  address: string;
  setAddress: (address: string) => void;
  isGeocoding: boolean;
}

const Cheque: FC<Props> = ({ order, address, setAddress, isGeocoding }) => {
  const { createOrder } = useUser();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateTime = tomorrow.toISOString().slice(0, 16);
  const [term, setTerm] = useState<string>(minDateTime);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTermChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTerm(e.target.value);
    if (error) setError("");
  };

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    if (error) setError("");
  };

  const handleCreateOrder = async () => {
    const selectedDate = new Date(term);
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const chequeOrder = {
      items: order.items,
      totalCost: order.totalCost,
      term: selectedDate,
      deliveryAddress: address,
    };
    try {
      setLoading(true);
      const isValidData = ChequeSchema.safeParse(chequeOrder);
      if (!isValidData.success) {
        const formattedError = formatZodError(isValidData.error);
        if (formattedError.message) {
          setError(formattedError.message);
        }
        return;
      }
      const res = await createOrder(chequeOrder);
      if (res.success) {
        setShowModal(true);
        setTimeout(() => {
          router.push("/dashboard/profile");
        }, 3000);
      } else {
        setError(res.message || "Ошибка при создании заказа");
      }
    } catch (error) {
      setError("Произошла ошибка при создании заказа");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const closeErrorModal = () => {
    setError("");
  };

  const closeSuccessModal = () => {
    setShowModal(false);
    router.push("/dashboard/profile");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      {error && (
        <Modal type="dialog" onClose={closeErrorModal}>
          {error}
        </Modal>
      )}
      {showModal && (
        <Modal type="dialog" onClose={closeSuccessModal}>
          <h3>Заказ успешно создан</h3>
          <p>Дата доставки: {formatDate(term)}</p>
          <p>Адрес доставки: {address}</p>
          <p>Перенаправляем в профиль...</p>
        </Modal>
      )}
      <div className={styles.cheque}>
        <h2 className={styles.cheque__title}>Заказ</h2>
        <table className={styles.cheque__body}>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className={styles.cheque__inner}>
                <td>{item.name}</td>
                <td>
                  <strong>{item.quantity}</strong>
                </td>
                <td>
                  <strong>{item.total}₽</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.cheque__footer}>
          {order.items.length > 0 ? (
            <>
              <label>
                Дата и время доставки
                <input
                  type="datetime-local"
                  min={minDateTime}
                  value={term}
                  onChange={handleTermChange}
                />
              </label>
              <label>
                Адрес доставки
                <input
                  disabled={isGeocoding}
                  type="text"
                  placeholder="Введите адрес"
                  value={isGeocoding ? "Поиск адреса. . . " : address}
                  onChange={handleAddressChange}
                />
              </label>
              <div className={styles["cheque__footer--inner"]}>
                <span>
                  Итого: <strong>{order.totalCost}₽</strong>
                </span>
                <Button variant="primary" onClick={handleCreateOrder}>
                  Оформить
                </Button>
              </div>
            </>
          ) : (
            <span>
              Итого: <strong>{order.totalCost}₽</strong>
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default Cheque;
