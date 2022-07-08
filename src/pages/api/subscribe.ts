import { NextApiRequest, NextApiResponse } from "next";
import { query as q } from "faunadb";
import { getSession } from "next-auth/react";
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";

type User = {
  ref: {
    id: string
  },
  data: {
    stripe_customer_id: string
  }
}
//Função para fazer as chamadas as APIS do stripe
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    //Pega as informações da sessão
    const session = await getSession({ req })
    //Verifica os usuários salvos no Fauna através do email
    const user = await fauna.query<User>(
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(session.user.email)
        )
      )
    )

    //Verifica o customer id do usuário
    let customerId = user.data.stripe_customer_id

    //Se não existe, cria um novo customer
    if (!customerId) {
      //Cria novo customer
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
        //metadata
      })
      //Salva o customerid no banco de dados
      await fauna.query(
        q.Update(
          q.Ref(q.Collection('users'), user.ref.id),
          {
            data: {
              stripe_customer_id: stripeCustomer.id
            }
          }
        )
      )

      customerId = stripeCustomer.id
    }

    //Cria a página de checkout do stripe
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        { price: 'price_1LDyuIFfYzg7B7CU5igysFME', quantity: 1 }
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL
    })
    //Retorna o status das requisições
    return res.status(200).json({ sessionId: stripeCheckoutSession.id })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed')
  }
}