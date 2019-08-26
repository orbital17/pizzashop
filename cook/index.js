const { connect } = require('mongodb')
const amqp = require('amqplib')
const { OrderStore } = require('../models/order')
const { Controller } = require('./controller')


const mongoConfig = {
  url: 'mongodb://mongodb:27017/pizzashop',
  options: {
    autoReconnect: true,
    reconnectTries: 10
  }
}

async function init() {
  const client = await connect(mongoConfig.url, mongoConfig.options)
  const db = client.db('pizzashop')

  const rabbitConn = await amqp.connect('amqp://rabbit')
  const rabbitChannel = await rabbitConn.createChannel()
  await rabbitChannel.assertQueue('newOrders', { durable: true })

  const orderStore = new OrderStore(db)
  const controller = new Controller(orderStore, rabbitChannel)

  rabbitChannel.consume('newOrders', controller.processOrder.bind(controller))
}

init()
