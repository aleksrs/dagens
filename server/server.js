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

app.get('/findClosest/:id', (req, res, next) => {
  const product = read(req.params.id);
  const productsInCategory = listProducts(product.category, 0, 0)
    .sort((a, b) => {
      if (a.price < b.price) return -1;
      if (a.price > b.price) return 1;
      return 0;
    });

  const productsToReturn = findClosestInPrice(productsInCategory, product, 10);

  res.send(productsToReturn);
})

app.post('/', (req, res, next) => {
  const newProduct = create(req.body);
  res.send(newProduct);
});

// Controllers
const create = (product) => {
  product.id = uuidv4();
  products.push(product);
  return read(product.id)
}

const read = (productID) => products.find(product => product.id === productID);

// Getters
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

// Helpers
const findClosestInPrice = (sortedList, initialProduct, numElements) => {
  const results = [];

  const initialPrice = initialProduct.price;
  let left = sortedList.indexOf(initialProduct) - 1;
  let right = left + 2;
  let counter = 0;

  while (left >= 0 && right < sortedList.length && counter < numElements) {
    const leftDiff = initialPrice - sortedList[left].price
    const rightDiff = sortedList[right].price - initialPrice;

    if (leftDiff < rightDiff) {
      results.push(sortedList[left]);
      left--;
    }
    else {
      results.push(sortedList[right]);
      right++;
    }
    counter ++;
  }

  while (counter < numElements && left >= 0) {
    results.push(sortedList[left]);
    left--;
  }

  while (counter < numElements && right < sortedList.length) {
    results.push(sortedList[right]);
    right++;
  }

  return results;
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
