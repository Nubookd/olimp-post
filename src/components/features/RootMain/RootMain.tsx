"use client";

import { FC, useEffect, useState } from "react";
import Catalog from "../Catalog";
import Cheque from "../Cheque";
import styles from "./RootMain.module.scss";
import { ICheque, IOrderItem } from "@/types";
import AddressMap from "../AddressMap";

interface Props {
  cildren?: React.ReactNode;
}

const RootMain: FC<Props> = () => {
  const term = new Date();
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [address, setAddress] = useState<string>("");
  const [order, setOrder] = useState<ICheque>({
    items: [],
    totalCost: 0,
    term: term,
    deliveryAddress: "",
    deliveryLat: 0,
    deliveryLon: 0,
  });

  const addItem = async (product: IOrderItem) => {
    setOrder((prev) => {
      const existingIndex = prev.items.findIndex(
        (item) => item.id === product.id,
      );

      let newItems: IOrderItem[];
      const newTotalCost = prev.totalCost + product.price;
      if (existingIndex >= 0) {
        newItems = [...prev.items];
        const existingItem = newItems[existingIndex];
        const newQuanty = existingItem.quantity! + 1;

        newItems[existingIndex] = {
          ...existingItem,
          quantity: newQuanty,
          total: product.price * newQuanty,
        };
      } else {
        const newItem: IOrderItem = {
          ...product,
          quantity: 1,
          total: product.price,
        };
        newItems = [...prev.items, newItem];
      }
      return {
        items: newItems,
        totalCost: newTotalCost,
        term,
      };
    });
  };
  return (
    <main className={styles.main}>
      <Catalog addItem={addItem} />
      <Cheque
        order={order}
        address={address}
        setAddress={setAddress}
        isGeocoding={isGeocoding}
      />
      {order.items.length > 0 && (
        <AddressMap
          setOrder={setOrder}
          setAddress={setAddress}
          setIsGeocoding={setIsGeocoding}
        />
      )}
    </main>
  );
};

export default RootMain;
