/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts.js';

const stripe = Stripe(
  'pk_test_51RgZkIIDPFC9fdTTeAZdyVVZG5AyvrBszAJ0TMJ5MzNd3LqapnDzqvk6JtvI6IK7QbItCmSJrXPWAzAiVPhOb5Hz00BGPxsPST',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    );
    console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
