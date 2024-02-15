import React, { useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API } from "aws-amplify";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../lib/errorLib";
import { s3Upload } from "../lib/awsLib";
import { NoteType } from "../types/note";
import config from "../config";
import "./NewNote.css"

export default function NewNote() {
  const nav = useNavigate()
  const file = useRef<null | File>(null)
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  function validateForm() {
    return content.length > 0
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.currentTarget.files === null) return
    file.current = event.currentTarget.files[0]
  }

  function createNote(note: NoteType) {
    return API.post("notes", "/notes", {
      body: note
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(`Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE / 1000000} MB.`)
      return
    }
    setIsLoading(true)
    try {
      const attachment = file.current ? await s3Upload(file.current) : undefined
      await createNote({ content, attachment })
      nav("/")
    } catch (error) {
      onError(error)
      setIsLoading(false)
    }
  }

  return (
    <div className="NewNote">
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="content">
          <Form.Control
            value={content}
            as="textarea"
            onChange={(e) => setContent(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mt-2" controlId="file">
          <Form.Label>Attachement</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} />
        </Form.Group>
        <LoaderButton
          size="lg"
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!validateForm()}
        >
          Create
        </LoaderButton>
      </Form>
    </div>
  )

}