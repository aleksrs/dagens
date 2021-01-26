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

app.get('/', (req, res, next) => {
  const category = req.query.category ? req.query.category : "";
  const minPrice = req.query.minPrice ? parseInt(req.query.minPrice) : 0;
  const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice) : 0;
  const page = req.query.page ? parseInt(req.query.page) : 0;

  const productsToPaginate = listProducts(category, minPrice, maxPrice);
  const resultsToReturn = paginate(productsToPaginate, page);
  res.send(resultsToReturn);
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

const listProducts = (category, minPrice, maxPrice) => {
  return products.filter((product) => {
    if (category && minPrice && maxPrice) return product.category === category && product.price >= minPrice && product.price <= maxPrice;
    if (category && minPrice) return product.category === category && product.price >= minPrice;
    if (category && maxPrice) return product.category === category && product.price <= maxPrice;
    if (category) return product.category === category;
    if (minPrice) return product.price >= minPrice;
    if (maxPrice) return product.price <=maxPrice;

    return product;
  })
}

const paginate = (items, page) => {
  const PAGE_LIMIT = 24;
  const start = (page - 1) * PAGE_LIMIT;
  const end = page * PAGE_LIMIT;

  const results = {
    nextPage: page && end < items.length ? page + 1 : null,
    prevPage: page && start > 0 ? page - 1 : null,
    data: page ? items.slice(start, end): items
  };

  return results;
}

process.on('SIGINT', function () {
  process.exit()
})
