import Auth from "@/lib/auth/authManager";
import { redirect } from "next/navigation";

const ProtectedLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await Auth.checkAuth();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
};

export default ProtectedLayout;
