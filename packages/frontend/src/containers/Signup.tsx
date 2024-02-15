import { useState } from "react";
import { Form, Stack } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ISignUpResult } from "amazon-cognito-identity-js";
import { Auth } from "aws-amplify";
import { onError } from "../lib/errorLib";
import { useFormFields } from "../lib/hooksLib";
import { useAppContext } from "../lib/contextLib";
import LoaderButton from "../components/LoaderButton";

export default function Signup() {
  const nav = useNavigate()
  const { userHasAuthenticated } = useAppContext()
  const [isLoading, setIsLoading] = useState(false)
  const [newUser, setNewUser] = useState<null | ISignUpResult>(null)
  const [user, handleFieldChange] = useFormFields({
    email: "",
    password: "",
    confirmPassword: "",
    confirmationCode: ""
  })

  function validateForm() {
    return (
      user.email.length > 0 && user.password.length > 0 && user.password === user.confirmPassword
    )
  }

  function validateConfirmationFor() {
    return user.comfirmationCode.length > 0
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    try {
      const newUser = await Auth.signUp({
        username: user.email,
        password: user.password
      })
      setIsLoading(false)
      setNewUser(newUser)
    } catch (error) {
      onError(error)
      setIsLoading(false)
    }
    setIsLoading(false)
  }

  async function handleConfirmationSubmit(event: React.FocusEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    try {
      await Auth.confirmSignUp(user.email, user.confirmationCode)
      await Auth.signIn(user.email, user.password)
      userHasAuthenticated(true)
      nav("/")
    } catch (error) {
      onError(error)
      setIsLoading(false)
    }
  }

  function renderConfirmationForm() {
    return (
      <Form onSubmit={handleConfirmationSubmit}>
        <Stack gap={3}>
          <Form.Group controlId="confirmationCode">
            <Form.Label>Confirmation Code</Form.Label>
            <Form.Control
              autoFocus
              size="lg"
              type="tel"
              value={user.confirmationCode}
              onChange={handleFieldChange}
            />
            <Form.Text muted>Please check your email for the code.</Form.Text>
          </Form.Group>
          <LoaderButton
            size="lg"
            type="submit"
            variant="success"
            isLoading={isLoading}
            disabled={!validateConfirmationFor()}
          >
            Verify
          </LoaderButton>
        </Stack>
      </Form>
    )
  }

  function renderForm() {
    return (
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
          <Form.Group controlId="confirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              size="lg"
              type="password"
              value={user.confirmPassword}
              onChange={handleFieldChange}
            />
          </Form.Group>
          <LoaderButton
            size="lg"
            type="submit"
            variant="success"
            isLoading={isLoading}
            disabled={!validateForm()}
          >
            Signup
          </LoaderButton>
        </Stack>
      </Form>
    )
  }

  return (
    <div className="Signup">
      {newUser === null ? renderForm() : renderConfirmationForm()}
    </div>
  )
}