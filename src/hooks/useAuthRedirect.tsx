import { useState } from "react";

export const useAuthRedirect = () => {
  const [isAuthChecking] = useState(false);
  return { isAuthChecking };
};