const express = require('express')
const { connect } = require('mongodb')
const amqp = require('amqplib')
const { OrderStore } = require('../models/order')
const { Controller } = require('./controller')

const mongoConfig = {
  url: process.env.MONGO_URL,
  options: {
    autoReconnect: true,
    reconnectTries: 10,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
}

const port = 3001

async function init() {
  const app = express()
  app.use(express.json())

  const client = await connect(
    mongoConfig.url,
    mongoConfig.options,
  )
  const db = client.db('pizzashop')

  const rabbitConn = await amqp.connect(process.env.RABBIT_URL)
  const rabbitChannel = await rabbitConn.createChannel()
  await rabbitChannel.assertQueue('newOrders', { durable: true })

  const orderStore = new OrderStore(db)
  const controller = new Controller(orderStore, rabbitChannel)

  app.post('/order', controller.createOrder.bind(controller))
  app.get('/orderStatus/:id', controller.orderStatus.bind(controller))

  app.listen(port, () => {
    console.log(`waiter listening to port ${port}`)
  })
}

init()
