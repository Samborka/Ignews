import { GetStaticProps } from 'next'
import Head from 'next/head'

import { SubscribeButton } from '../components/SubscribeButton'
import { stripe } from '../services/stripe'

import styles from './home.module.scss'

interface HomeProps{
  product:{
    priceId: string,
    amount: number
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>
          Home | ignews
        </title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome!</span>
          <h1>News abou the <span>React</span> world.</h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId}/>
        </section>
        <img src="/images/avatar.svg" alt="Girl Coding" />
      </main>
    </>
  )
}

//Chamada a API atraves do stripe
export const getStaticProps: GetStaticProps =  async () => {
  const price = await stripe.prices.retrieve('price_1LDyuIFfYzg7B7CU5igysFME')

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price.unit_amount / 100),
  }

  return{
    props:{
      product
    },
    revalidate: 60 * 60 * 24 // 24 horas
  }
}

/*Chamadas a API tem 3 tipos:
Client-Side - outros casos
Server-Side - Infos que alteram de acordo com usuario
Static Site Generation - Infos estaticas que nao mudam pra ninguem, precisa da indexacao do google
*/