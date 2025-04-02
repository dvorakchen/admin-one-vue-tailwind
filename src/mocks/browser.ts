import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { handlers as bed_handlers } from "./bed_handlers";

export const worker = setupWorker(...handlers, ...bed_handlers);
