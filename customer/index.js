const express = require('express')
const fetch = require('node-fetch')

const { WAITER_URL } = process.env
const PORT = 3000

function makeOrder() {
  return fetch(`${WAITER_URL}/order`, {
    method: 'post',
    body: JSON.stringify({
      order: {
        pizzas: [
          {
            ingridients: [
              'cheese',
              'tomato'
            ]
          }
        ]
      }
    }),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
}


function getStatus(id) {
  return fetch(`${WAITER_URL}/orderStatus/${id}`)
    .then(res => res.json())
}


async function init() {
  const app = express()
  app.use(express.json())

  app.get('/makeOrder', (req, res) => {
    makeOrder()
      .then(result => res.json(result))
  })

  app.get('/orderStatus/:id', (req, res) => {
    getStatus(req.params.id)
      .then(result => res.json(result))
  })

  app.listen(PORT, () => {
    console.log(`customer listening to port ${PORT}`)
  })
}

init()
