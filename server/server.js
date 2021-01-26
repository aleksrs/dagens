const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const products = require('./db')
const { v4: uuidv4 } = require('uuid');

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

http.createServer(app).listen(3001, () => {
  console.log('Listen on 0.0.0.0:3001')
})

app.get('/', (_, res) => {
  res.send({ status: 200 })
})

app.post('/', (req, res, next) => {
  const newProduct = create(req.body);
  res.send(newProduct);
});

const create = (product) => {
  product.id = uuidv4();
  products.push(product);
  return read(product.id)
}

const read = (productID) => products.find(product => product.id === productID);

process.on('SIGINT', function () {
  process.exit()
})
