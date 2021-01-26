import { Component } from 'react'
import axios         from 'axios'
import "../styles/productForm.css";

function OnSubmitMessage (props) {
  if (!props.submitMessage.type) {
    return null
  }

  if (props.submitMessage.type === 'success') {
    return (
      <div className="submit-message-success">
        <h3>Produkt opprettet!</h3>
        <p>{props.submitMessage.message}</p>
      </div>
    )
  }

  return (
    <div className="submit-message-error">
      <h3>Oops, noe gikk galt</h3>
      <p>{props.submitMessage.message}</p>
    </div>
  )
}

export default class ProductForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      category: '',
      price: 0,
      validForm: false,
      submitMessage: {
        type: '',
        message: ''
      }
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  validForm () {
    return this.state.name.length &&
      (this.state.category === 'fish' ||
        this.state.category === 'greens' ||
        this.state.category === 'meat') &&
      this.state.price > 0
  }

  handleChange (event) {
    this.setState({
      [event.target.name]: event.target.value
    })
    if (this.validForm()) {
      this.setState({ validForm: true })
    }
    else {
      this.setState({ validForm: false })
    }
  }

  handleSubmit (event) {
    event.preventDefault()
    const BASE_URL = 'http://localhost:3001'

    const product = {
      name: this.state.name,
      category: this.state.category,
      price: this.state.price
    }

    axios.post(`${BASE_URL}/`, product)
      .then((res) => {
        this.setState({
          submitMessage: {
            type: 'success',
            message: 'Opprettet produkt med ID: ' + res.data.id
          }
        })
      })
      .catch((e) => {
        this.setState({
          submitMessage: {
            type: 'error',
            message: 'Noe gikk galt under oppretting av produkt'
          }
        })
      })
  }

  render () {
    return (
      <div className="product-form">
        <h3>Opprett nytt produkt</h3>
        <form>
          <label>Navn:</label>
          <br />
          <input type="text" name="name" value={this.state.name} onChange={this.handleChange} />
          <br />

          <label>Kategori:</label>
          <br />
          <select name="category" value={this.state.category} onChange={this.handleChange}>
            <option value="">Velg kategori</option>
            <option value="fish">Fisk</option>
            <option value="greens">Grønnsak</option>
            <option value="meat">Kjøtt</option>
          </select>
          <br />

          <label>Pris:</label>
          <br />
          <input type="number" name="price" onChange={this.handleChange} />
          <br />
          <button
            style={{ marginTop: '15px' }}
            type="button"
            onClick={this.handleSubmit}
            disabled={!this.state.validForm}
          >
            Send inn
          </button>
        </form>
        <OnSubmitMessage submitMessage={this.state.submitMessage} />
      </div>
    )
  }
}
