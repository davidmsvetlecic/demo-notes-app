import React, { useState } from "react";
import { Form, Stack } from "react-bootstrap";
import { Auth } from "aws-amplify";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../lib/errorLib";
import { useAppContext } from "../lib/contextLib";
import { useFormFields } from "../lib/hooksLib";
import "./Login.css";

export default function Login() {
  const { userHasAuthenticated } = useAppContext()
  const [isLoading, setIsLoading] = useState(false)
  const [user, handleFieldChange] = useFormFields({
    email: "",
    password: ""
  })

  function validateForm() {
    return user.email.length > 0 && user.password.length > 0
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    try {
      await Auth.signIn(user.email, user.password)
      userHasAuthenticated(true)
    } catch (error) {
      onError(error)
      setIsLoading(false)
    }
  }

  return (
    <div className="Login">
      <Form onSubmit={handleSubmit}>
        <Stack gap={3}>
          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              autoFocus
              size="lg"
              type="email"
              value={user.email}
              onChange={handleFieldChange}
            />
          </Form.Group>
          <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              size="lg"
              type="password"
              value={user.password}
              onChange={handleFieldChange}
            />
          </Form.Group>
          <LoaderButton
            size="lg"
            type="submit"
            isLoading={isLoading}
            disabled={!validateForm()}
          >
            Login
          </LoaderButton>
        </Stack>
      </Form>
    </div>
  )
}