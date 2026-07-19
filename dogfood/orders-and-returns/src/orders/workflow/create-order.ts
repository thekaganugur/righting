import { calculateTotal } from "../rules/calculate-total.ts";
import { saveOrder } from "../gateway/orders-gateway.ts";

export function createOrder() {
  return `${calculateTotal()}:${saveOrder()}`;
}
