const express = require('express')
const { connect } = require('mongodb')
const { OrderStore } = require('./order')
const { Controller } = require('./controller')


const mongoConfig = {
  url: 'mongodb://mongodb:27017/pizzashop',
  options: {
    autoReconnect: true,
    reconnectTries: 10
  }
}

const port = 3001


async function init() {
  const app = express()
  app.use(express.json())

  const client = await connect(mongoConfig.url, mongoConfig.options)
  const db = client.db('pizzashop')

  const orderStore = new OrderStore(db)
  const controller = new Controller(orderStore)

  app.post('/order', controller.createOrder.bind(controller))

  app.listen(port, () => {
    console.log(`waiter listening to port ${port}`)
  })
}

init()
