import { getSession, useSession } from "next-auth/react";
import React from "react";
import Header from "../components/Header/Header";
import { collection, doc, getDoc, getDocs, orderBy } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import moment from "moment";
import Order from "../components/Order/Order";

function Orders({ orders }) {
  const { data: session } = useSession();

  console.log("orders", orders);

  return (
    <div>
      <Header />
      <main className="max-w-screen-lg mx-auto p-10">
        <h1 className="text-3xl border-b mb-2 pb-2 border-yellow-400">
          Your Orders
        </h1>

        {session ? (
          <h2>{orders.length} Orders</h2>
        ) : (
          <h2>Please sign in to see your orders</h2>
        )}

        <div className="mt-5 space-y-4">
          {orders?.map((order) => (
            <Order
              key={order.id}
              id={order.id}
              amount={order.amount}
              amountShipping={order.amountShipping}
              items={order.items}
              timestamp={order.timestamp}
              images={order.images}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default Orders;

export async function getServerSideProps(context) {
  // Anything in getServerSideProps is basically NodeJs

  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const firebaseConfig = {
    apiKey: "AIzaSyBhLf2v2dA5TZihXDcorLG2C8WSioIVz6E",
    authDomain: "clone-99be1.firebaseapp.com",
    projectId: "clone-99be1",
    storageBucket: "clone-99be1.appspot.com",
    messagingSenderId: "972127569397",
    appId: "1:972127569397:web:ca44e6dff15ac339ab4cbc",
  };

  // Get the users logged in credentials

  const session = await getSession(context);

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize Cloud Firestore and get a reference to the service
  const db = getFirestore(app);

  if (!session) {
    return {
      props: {},
    };
  }

  const docRef = collection(db, "users", session.user.email, "orders");
  const ordersSnap = await getDocs(docRef, orderBy("timestamp", "desc"));

  const orders = await Promise.all(
    ordersSnap.docs.map(async (order) => ({
        key: order.id,
      id: order.id,
      amount: order.data().amount,
      amountShipping: order.data().amount_shipping,
      images: order.data().images,
      timestamp: moment(order.data().timestamp.toDate()).unix(),
      items: (
        await stripe.checkout.sessions.listLineItems(order.id, {
          limit: 100,
        })
      ).data,
    }))
  );

  console.log("orders", orders);

  return {
    props: {
      orders,
    },
  };
}
