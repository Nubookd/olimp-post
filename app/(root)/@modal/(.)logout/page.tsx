"use client";

import React, { FC, FormEvent } from "react";
import styles from "./page.module.scss";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface Props {
  children?: React.ReactNode;
}

const LogoutModal: FC<Props> = () => {
  const { checkAuth } = useAuthContext();
  const { logout } = useAuth();

  const Logout = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await logout();
      await checkAuth();
      window.location.href = "/";
    } catch (error) {
      throw new Error("post: ");
    }
  };

  return (
    <Modal type="action">
      <Button variant="primary">
        <Link scroll={false} href="/dashboard/profile">Кабинет</Link>
      </Button>
      <Button variant="secondary" onClick={Logout}>
        Выйти
      </Button>
    </Modal>
  );
};

export default LogoutModal;
