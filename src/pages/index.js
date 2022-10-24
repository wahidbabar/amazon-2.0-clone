import Head from "next/head";
import Header from "../components/Header/Header";
import Banner from "../components/Banner/Banner";
import ProductFeed from "../components/ProductFeed/ProductFeed";

export default function Home({products}) {
  return (
    <div className="bg-gray-200">
      <Head>
        <title>Amazon 2.0</title>
      </Head>

      <Header />

      <main className="max-w-screen-2xl mx-auto">
        <Banner />
        <ProductFeed products={products} />
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  // this function tells NextJS that "this is no longer a static page. It needs to have that middle server step. Please calculate something on the server first and then render to the user"

  const products = await fetch("https://fakestoreapi.com/products").then(
    (res) => res.json()
  );

  return {
    props: {
      products,
    },
  };
}

// GET >>>> https://fakestoreapi.com/products
