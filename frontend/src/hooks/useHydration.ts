import { useEffect, useState } from "react";

export const useHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // This effect runs only on the client side after hydration
    setIsHydrated(true);
  }, []);

  return isHydrated;
};
