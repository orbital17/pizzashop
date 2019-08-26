const express = require('express')
const fetch = require('node-fetch')

const waiterUrl = `http://localhost:3001`

const port = 3000

function makeOrder() {
  return fetch(`${waiterUrl}/order`, {
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


async function init() {
  const app = express()
  app.use(express.json())

  app.get('/makeOrder', (req, res) => {
    makeOrder()
      .then(result => res.json(result))
  })

  app.listen(port, () => {
    console.log(`customer listening to port ${port}`)
  })
}

init()
