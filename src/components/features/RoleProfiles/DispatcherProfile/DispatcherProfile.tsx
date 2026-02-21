import React, { FC } from "react";
import styles from "./DispatcherProfile.module.scss";

interface Props {
  children?: React.ReactNode;
}

const DispatcherProfile: FC<Props> = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  )
};

export default DispatcherProfile;

