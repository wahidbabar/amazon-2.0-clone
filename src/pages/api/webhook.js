import { buffer } from "micro";

import { initializeApp } from "firebase/app";
import { collection, getFirestore, Timestamp } from "firebase/firestore";
import { setDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhLf2v2dA5TZihXDcorLG2C8WSioIVz6E",
  authDomain: "clone-99be1.firebaseapp.com",
  projectId: "clone-99be1",
  storageBucket: "clone-99be1.appspot.com",
  messagingSenderId: "972127569397",
  appId: "1:972127569397:web:ca44e6dff15ac339ab4cbc",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const serviceAccount = require("../../../permissions.json");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_SIGNING_SECRET;

const fulfillOrder = async (session) => {
  try {
    const ordersRef = collection(db, "users");
    const dockRef = doc(
      ordersRef,
      session.metadata.email,
      "orders",
      session.id
    );

    const data = {
      amount: session.amount_total / 100,
      amount_shipping: session.total_details.amount_shipping / 100,
      images: JSON.parse(session.metadata.images),
      timestamp: Timestamp.now(),
    };
    setDoc(dockRef, data);

    console.log("Document written with ID: ", session.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export default async (req, res) => {
  if (req.method === "POST") {
    const requestBuffer = await buffer(req);
    const payload = requestBuffer.toString();
    const sig = req.headers["stripe-signature"];

    let event;

    // Verify that the EVENT posted came from stripe
    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (error) {
      console.log("ERROR", error.message);
      return res.status(400).send(`Webhook error: ${error.message}`);
    }

    // Handler the checkout.session.complete event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      //Fulfill the order
      return fulfillOrder(session)
        .then(() => res.status(200).json({ received: true }))
        .catch((error) =>
          res.status(400).send(`Webhook Error: ${error.message}`)
        );
    }
  }
};

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
