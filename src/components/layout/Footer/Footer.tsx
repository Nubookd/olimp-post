import React, { FC } from "react";
import styles from "./Footer.module.scss";

interface Props {
  children?: React.ReactNode;
}

const Footer: FC<Props> = ({ children }) => {
  return (
    <footer className={styles.footer}>
      footer - - -
      {children}
    </footer>
  )
};

export default Footer;

