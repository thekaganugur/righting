import { orderScreen } from "../orders/screen/order-screen.ts";
import { returnScreen } from "../returns/screen/return-screen.ts";

export const application = [orderScreen(), returnScreen()];
