import { useState, useEffect } from "react"
import Filter from "./components/Filter"
import PersonForm from "./components/PersonForm"
import Persons from "./components/Persons"
import Notification from "./components/Notification"
import personService from "./services/persons"

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState("")
  const [newNumber, setNewNumber] = useState("")
  const [search, setSearch] = useState("")
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    personService.getAll().then((initialPersons) => {
      setPersons(initialPersons)
    })
  }, [])

  const showNotification = (text, type) => {
    setNotification({ text, type })
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  const addPerson = (event) => {
    event.preventDefault()
    const existingPerson = persons.find((person) => person.name === newName)
    if (existingPerson) {
      if (window.confirm(newName + " is already added to phonebook, replace the old number with a new one?")) {
        const changedPerson = { ...existingPerson, number: newNumber }
        personService
          .update(existingPerson.id, changedPerson)
          .then((returnedPerson) => {
            setPersons(persons.map((person) => (person.id !== existingPerson.id ? person : returnedPerson)))
            showNotification("Updated " + newName, "success")
            setNewName("")
            setNewNumber("")
          })
          .catch((error) => {
            if (error.response && error.response.data && error.response.data.error) {
              showNotification(error.response.data.error, "error")
            } else {
              showNotification("Information of " + newName + " has already been removed from server", "error")
              setPersons(persons.filter((person) => person.id !== existingPerson.id))
            }
          })
      }
      return
    }
    const personObject = { name: newName, number: newNumber }
    personService
      .create(personObject)
      .then((returnedPerson) => {
        setPersons(persons.concat(returnedPerson))
        showNotification("Added " + newName, "success")
        setNewName("")
        setNewNumber("")
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error) {
          showNotification(error.response.data.error, "error")
        } else {
          showNotification("Failed to add " + newName, "error")
        }
      })
  }

  const handleDelete = (person) => {
    if (window.confirm("Delete " + person.name + " ?")) {
      personService.remove(person.id).then(() => {
        setPersons(persons.filter((p) => p.id !== person.id))
      })
    }
  }

  const personsToShow =
    search === ""
      ? persons
      : persons.filter((person) => person.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification} />
      <Filter search={search} handleSearchChange={(event) => setSearch(event.target.value)} />
      <h3>Add a new</h3>
      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handleNameChange={(event) => setNewName(event.target.value)}
        newNumber={newNumber}
        handleNumberChange={(event) => setNewNumber(event.target.value)}
      />
      <h3>Numbers</h3>
      <Persons persons={personsToShow} handleDelete={handleDelete} />
    </div>
  )
}

export default App
