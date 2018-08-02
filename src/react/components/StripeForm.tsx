import * as React from "react";
import { CardElement, injectStripe } from "react-stripe-elements";

class StripeForm extends React.Component {}

export default injectStripe(StripeForm);
