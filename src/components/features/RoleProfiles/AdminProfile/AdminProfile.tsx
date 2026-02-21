import React, { FC } from "react";
import styles from "./AdminProfile.module.scss";

interface Props {
  children?: React.ReactNode;
}

const AdminProfile: FC<Props> = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  )
};

export default AdminProfile;

