import { useEffect, useState } from "react"
import { ListGroup } from "react-bootstrap"
import { LinkContainer } from "react-router-bootstrap"
import { BsPencilSquare } from "react-icons/bs"
import { API } from "aws-amplify"
import { useAppContext } from "../lib/contextLib"
import { onError } from "../lib/errorLib"
import { NoteType } from "../types/note"
import "./Home.css"

export default function Home() {
  const { isAuthenticated } = useAppContext()
  const [notes, setNotes] = useState<Array<NoteType>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    function loadNotes() {
      return API.get("notes", "/notes", {})
    }
    async function onLoad() {
      if (!isAuthenticated) {
        return
      }
      try {
        const notes = await loadNotes()
        setNotes(notes)
      } catch (error) {
        onError(error)
      }
      setIsLoading(false)
    }
    onLoad()
  }, [isAuthenticated])

  function formatDate(str: undefined | string) {
    return str ? new Date(str).toLocaleString() : ""
  }

  function renderNotesList(notes: NoteType[]) {
    return (
      <>
        <LinkContainer to="/notes/new">
          <ListGroup.Item action className="py-3 text-nowrap text-truncate">
            <BsPencilSquare size={17} />
            <span className="ms-2 fw-bold">Create a new note</span>
          </ListGroup.Item>
        </LinkContainer>
        {notes.map(({ noteId, content, createdAt }) => (
          <LinkContainer key={noteId} to={`/notes/${noteId}`}>
            <ListGroup.Item action className="text-nowrap text-truncate">
              <span className="fw-bold">{content.trim().split("\n")[0]}</span>
              <br />
              <span className="text-muted">
                Created: {formatDate(createdAt)}
              </span>
            </ListGroup.Item>
          </LinkContainer>
        ))}
      </>
    )
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>Scratch</h1>
        <p className="text-muted">A Simple note taking app</p>
      </div>
    )
  }

  function renderNotes() {
    return (
      <div className="notes">
        <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Notes</h2>
        <ListGroup>{!isLoading && renderNotesList(notes)}</ListGroup>
      </div>
    )
  }


  return (
    <div className="Home">
      {isAuthenticated ? renderNotes() : renderLander()}
    </div>
  )
}