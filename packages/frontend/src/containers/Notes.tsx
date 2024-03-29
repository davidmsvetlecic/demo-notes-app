import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Stack } from "react-bootstrap";
import { API, Storage } from "aws-amplify";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../lib/errorLib";
import { s3Upload } from "../lib/awsLib";
import { NoteType } from "../types/note";
import config from "../config";
import "./Notes.css"

export default function Notes() {
  const nav = useNavigate()
  const { id } = useParams()
  const file = useRef<null | File>(null)
  const [note, setNote] = useState<null | NoteType>(null)
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    function loadNote() {
      return API.get("notes", `/notes/${id}`, {})
    }
    async function onLoad() {
      try {
        const note = await loadNote()
        const { content, attachment } = note
        if (attachment) {
          note.attachmentURL = await Storage.vault.get(attachment)
        }
        setContent(content)
        setNote(note)
      } catch (error) {
        onError(error)
      }
    }
    onLoad()
  }, [id])

  function validateForm() {
    return content.length > 0
  }

  function formatFilename(str: string) {
    return str.replace(/^\w+-/, "")
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.currentTarget.files === null) return
    file.current = event.currentTarget.files[0]
  }

  function saveNote(note: NoteType) {
    return API.put("notes", `/notes/${id}`, {
      body: note
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    let attachment;

    event.preventDefault();

    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(`Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE / 1000000} MB.`);
      return;
    }

    setIsLoading(true)

    try {
      if (file.current) {
        attachment = await s3Upload(file.current)
      } else if (note && note.attachment) {
        attachment = note.attachment
      }
      await saveNote({
        content,
        attachment
      })
      nav("/")
    } catch (error) {
      onError(error)
      setIsLoading(false)
    }
  }

  function deleteNote() {
    return API.del("notes", `/notes/${id}`, {})
  }

  async function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const confirmed = window.confirm("Are you sure you want to delete this note?")
    if (!confirmed) {
      return
    }
    setIsDeleting(true)
    try {
      await deleteNote()
      nav("/")
    } catch (error) {
      onError(error)
      setIsDeleting(false)
    }
  }

  return (
    <div className="Notes">
      {note && (
        <Form onSubmit={handleSubmit}>
          <Stack gap={3}>
            <Form.Group controlId="content">
              <Form.Control
                size="lg"
                as="textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mt-2" controlId="file">
              <Form.Label>Attachment</Form.Label>
              {note.attachment && (
                <p>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={note.attachmentURL}
                  >
                    {formatFilename(note.attachment)}
                  </a>
                </p>
              )}
              <Form.Control
                type="file"
                onChange={handleFileChange}
              />
            </Form.Group>
            <Stack gap={1}>
              <LoaderButton
                size="lg"
                type="submit"
                isLoading={isLoading}
                disabled={!validateForm()}
              >
                Save
              </LoaderButton>
              <LoaderButton
                size="lg"
                variant="danger"
                isLoading={isDeleting}
                onClick={handleDelete}
              >
                Delete
              </LoaderButton>
            </Stack>
          </Stack>
        </Form>
      )}
    </div>
  )
}