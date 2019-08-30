const { connect } = require('mongodb')
// const amqp = require('amqplib')
const { OrderStore } = require('../models/order')


const mongoConfig = {
  url: process.env.MONGO_URL,
  options: {
    autoReconnect: true,
    reconnectTries: 10,
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
}

async function init() {
  const client = await connect(mongoConfig.url, mongoConfig.options)
  const db = client.db()

  const orderStore = new OrderStore(db)
  const result = await test(orderStore)
  if (result) {
    console.log('PASSED')
  } else {
    console.log('FAILED')
  }
  await client.close()
}

async function test(orderStore) {
  const id = '5d63d991dee4aa40d7df2e63'
  const doc = await orderStore.getById(id)
  if (doc.status != 'ready') {
    return false
  }
  return true
}

init()
