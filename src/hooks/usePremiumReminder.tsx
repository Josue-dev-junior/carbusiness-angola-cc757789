import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

const REMINDER_INTERVAL = 60 * 60 * 1000; // 1 hora em milissegundos
const LAST_REMINDER_KEY = "premium_last_reminder";

export const usePremiumReminder = () => {
  const { user, isPremium } = useAuth();
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    // Não mostrar lembretes se não estiver logado ou já for premium
    if (!user || isPremium) {
      return;
    }

    const checkAndShowReminder = () => {
      const lastReminder = localStorage.getItem(LAST_REMINDER_KEY);
      const now = Date.now();

      if (!lastReminder || now - parseInt(lastReminder) >= REMINDER_INTERVAL) {
        setShowReminder(true);
        localStorage.setItem(LAST_REMINDER_KEY, now.toString());
      }
    };

    // Verificar imediatamente ao carregar
    checkAndShowReminder();

    // Configurar intervalo para verificar a cada hora
    const interval = setInterval(checkAndShowReminder, REMINDER_INTERVAL);

    return () => clearInterval(interval);
  }, [user, isPremium]);

  const dismissReminder = () => {
    setShowReminder(false);
  };

  return { showReminder, dismissReminder };
};
