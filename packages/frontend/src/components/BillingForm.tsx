import React, { useState } from "react";
import { Form, Stack } from "react-bootstrap";
import { StripeError, Token } from "@stripe/stripe-js";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import LoaderButton from "./LoaderButton";
import { useFormFields } from "../lib/hooksLib";

export interface BillingFormType {
  isLoading: boolean;
  onSubmit: (storage: string, info: { token?: Token; error?: StripeError }) => Promise<void>
}

export function BillingForm({ isLoading, onSubmit }: BillingFormType) {
  const stripe = useStripe()
  const elements = useElements()
  const [fields, handleFieldChange] = useFormFields({ name: "", storage: "" })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCardComplete, setIsCardComplete] = useState(false)

  isLoading = isProcessing || isLoading

  function validateForm() {
    return (
      stripe && elements && fields.name.length && fields.storage.length && isCardComplete
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!stripe || !elements) {
      // Prevent form submission until Stripe.js has loaded.
      return
    }
    setIsProcessing(true)
    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      return
    }
    const { token, error } = await stripe.createToken(cardElement)
    setIsProcessing(false)
    onSubmit(fields.storage, { token, error })
  }

  return (
    <Form className="BillingForm" onSubmit={handleSubmit}>
      <Form.Group controlId="storage">
        <Form.Label>Storage</Form.Label>
        <Form.Control
          min="0"
          size="lg"
          type="number"
          value={fields.storage}
          onChange={handleFieldChange}
          placeholder="Number of notes to store"
        />
      </Form.Group>
      <hr />
      <Stack gap={3}>
        <Form.Group controlId="name">
          <Form.Label>Cardholder&apos;s name</Form.Label>
          <Form.Control
            size="lg"
            type="text"
            value={fields.name}
            onChange={handleFieldChange}
            placeholder="Name on the card"
          />
        </Form.Group>
        <div>
          <Form.Label>Credit Card Info</Form.Label>
          <CardElement
            className="card-field"
            onChange={(e) => setIsCardComplete(e.complete)}
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  fontWeight: "400",
                  color: "#495057",
                  fontFamily: "'Open Sans', sans-serif"
                }
              }
            }}
          />
        </div>
        <LoaderButton
          size="lg"
          type="submit"
          isLoading={isLoading}
          disabled={!validateForm}
        >
          Purchase
        </LoaderButton>
      </Stack>
    </Form>
  )

}