"use client";

import React, { FC } from "react";
import styles from "./page.module.scss";
import { useAuthContext } from "@/context/AuthContext";
import Orders from "./orders/page";
import CustomerProfile from "@/components/features/RoleProfiles/CustomerProfile";
import Loader from "@/components/ui/Loader";

interface Props {
  children?: React.ReactNode;
}

const Page: FC<Props> = ({ children }) => {
  const { user } = useAuthContext();
  if (user) {
    return (
      <main>
        <div className={styles.user}>
          <span>Личный кабинет: {user.login}</span>
        </div>

        {user.role === "CUSTOMER" && (
          <>
            <CustomerProfile>Покупатель</CustomerProfile>
            <Orders />
          </>
        )}
        {user.role === "DISPATCHER" && (
          <>
            <CustomerProfile>Диспечер</CustomerProfile>
            <Orders />
          </>
        )}
        {user.role === "OPERATOR" && (
          <>
            <CustomerProfile>Оператор</CustomerProfile>
            <Orders />
          </>
        )}
        {user.role === "COURIER" && (
          <>
            <CustomerProfile>Водитель</CustomerProfile>
            <Orders />
          </>
        )}
        {user.role === "ADMIN" && (
          <>
            <CustomerProfile>Админ</CustomerProfile>
            <Orders />
          </>
        )}
      </main>
    );
  } else {
    return <Loader />;
  }
};

export default Page;
