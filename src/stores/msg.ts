import { defineStore } from "pinia";
import { ref } from "vue";

const DEFAULT_DURATION = 5_000;
let countId = 0;

export type Message = {
  color: "info" | "success" | "warning" | "error";
  value: string;
  duration?: number;
};

export type Notification = {
  color: "info" | "success" | "warning" | "error";
  value: string;
};

export const useMsgStore = defineStore("message and notification", () => {
  const messages = ref(new Map());
  const notifications = ref([] as Notification[]);

  function pushMsg(msg: Message): void {
    const id = ++countId;

    messages.value.set(id, msg);
    setTimeout(() => {
      messages.value.delete(id);
    }, msg.duration ?? DEFAULT_DURATION);
  }

  function pushNotification(notif: Notification): void {
    notifications.value.push(notif);
  }

  return {
    messages,
    notifications,
    pushMsg,
    pushNotification,
  };
});
