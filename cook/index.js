const { connect } = require('mongodb')
const amqp = require('amqplib')
const { OrderStore } = require('../models/order')
const { Controller } = require('./controller')


const mongoConfig = {
  url: process.env.MONGO_URL,
  options: {
    autoReconnect: true,
    reconnectTries: 10
  }
}

async function init() {
  const client = await connect(mongoConfig.url, mongoConfig.options)
  const db = client.db('pizzashop')

  const rabbitConn = await amqp.connect(process.env.RABBIT_URL)
  const rabbitChannel = await rabbitConn.createChannel()
  await rabbitChannel.assertQueue('newOrders', { durable: true })
  await rabbitChannel.assertQueue('readyOrders', { durable: true })
  rabbitChannel.prefetch(1)

  const orderStore = new OrderStore(db)
  const controller = new Controller(orderStore, rabbitChannel)

  rabbitChannel.consume('newOrders', controller.processOrder.bind(controller))
}

init()
