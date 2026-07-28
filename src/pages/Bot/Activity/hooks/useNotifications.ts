import { useCallback, useEffect, useRef, useState } from 'react';
import { activityService } from '../data/activityService';
import type { NotificationItem } from '../types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[] | null>(null);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;

    const load = async () => {
      const next = await activityService.fetchNotifications();
      if (activeRef.current) setNotifications(next);
    };

    void load();

    const unsubscribe = activityService.subscribe(() => {
      void load();
    });

    return () => {
      activeRef.current = false;
      unsubscribe();
    };
  }, []);

  const markAllRead = useCallback(async () => {
    const next = await activityService.markAllRead();
    if (activeRef.current) setNotifications(next);
  }, []);

  return {
    notifications: notifications ?? [],
    isLoading: notifications === null,
    markAllRead,
  };
}

export type UseNotificationsReturn = ReturnType<typeof useNotifications>;
