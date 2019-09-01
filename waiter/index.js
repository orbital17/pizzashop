const express = require('express')
const { connect } = require('mongodb')
const amqp = require('amqplib')
const socketio = require('socket.io')
const http = require('http')
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

const PORT = 3001

async function init() {
  const app = express()
  app.use(express.json())

  const server = http.createServer(app)
  const io = socketio(server)

  const client = await connect(
    mongoConfig.url,
    mongoConfig.options,
  )
  const db = client.db('pizzashop')

  const rabbitConn = await amqp.connect(process.env.RABBIT_URL)
  const rabbitChannel = await rabbitConn.createChannel()
  await rabbitChannel.assertQueue('newOrders', { durable: true })

  const orderStore = new OrderStore(db)
  const controller = new Controller(orderStore, rabbitChannel, io)

  app.post('/order', controller.createOrderEndpoint.bind(controller))
  app.get('/orderStatus/:id', controller.orderStatus.bind(controller))

  io.on('connection', controller.socketConnection.bind(controller))

  server.listen(PORT, () => {
    console.log(`waiter listening to port ${PORT}`)
  })
}

init()
