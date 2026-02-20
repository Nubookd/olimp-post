"use client";

import React, { FC, FormEvent, useEffect, useState } from "react";
import styles from "./page.module.scss";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

interface Props {
  children?: React.ReactNode;
}

interface UserData {
  login: string;
  password: string;
}
const LoginModal: FC<Props> = () => {
  const [userData, setUserData] = useState<UserData>({
    login: "",
    password: "",
  });
  const { checkAuth, user } = useAuthContext();
  const { login } = useAuth();
  const [error, setError] = useState({
    loginError: "",
    passwordError: "",
    generalError: "",
  });
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(false);

  useEffect(() => {
    console.log(user)
    if (redirectAfterLogin && user) {
      if (user?.role === "ADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard/profile";
      }
    }
  }, [redirectAfterLogin, user, checkAuth]);

  const Login = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await login(userData);
      if (res.success) {
        const isAuth = await checkAuth();
        if (isAuth.success) {
          console.log(user)
          setRedirectAfterLogin(true);
        }
      } else {
        if (res.errors) {
          setError({
            loginError: res.errors.login || "",
            passwordError: res.errors.password || "",
            generalError: res.message || "",
          });
        } else if (res.message.includes("| password")) {
          setError({
            loginError: "",
            passwordError: res.message.slice(0, -11),
            generalError: "",
          });
        } else if (res.message.includes("| general")) {
          setError({
            loginError: "",
            passwordError: "",
            generalError: res.message.slice(0, -10),
          });
        } else {
          setError({
            loginError: "",
            passwordError: "",
            generalError: res.message,
          });
        }
      }
    } catch (error) {
      throw new Error("post: ");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "login") {
      setError((prev) => ({
        ...prev,
        loginError: "",
      }));
    }
    if (name === "password") {
      setError((prev) => ({
        ...prev,
        passwordError: "",
      }));
    }
    setError((prev) => ({
      ...prev,
      generalError: "",
    }));
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Modal type="action">
      <form onSubmit={Login} className={styles["modal__form"]}>
        <span className={styles.modal__title}>Вход в систему</span>
        {error.generalError && (
          <span className={styles["modal__form-inputSpan"]}>
            {error.generalError}
          </span>
        )}
        <label>
          <input
            type="text"
            placeholder="Логин"
            name="login"
            value={userData.login}
            onChange={handleChange}
            className={error.loginError ? styles.error : ""}
          />
          {error.loginError && (
            <span className={styles["modal__form-inputSpan"]}>
              {error.loginError}
            </span>
          )}
        </label>
        <label>
          <input
            type="password"
            placeholder="Пароль"
            name="password"
            value={userData.password}
            onChange={handleChange}
            className={error.passwordError ? styles.error : ""}
          />
          {error.passwordError && (
            <span className={styles["modal__form-inputSpan"]}>
              {error.passwordError}
            </span>
          )}
        </label>
        <Button variant="primary" type="submit">
          Войти
        </Button>
      </form>
    </Modal>
  );
};

export default LoginModal;
