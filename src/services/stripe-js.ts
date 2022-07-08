import { loadStripe } from "@stripe/stripe-js";

//Chave pública do Stripe para ser usada no front
export async function getStripeJs() {
  const stripeJs = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

  return stripeJs
}