const test = require('ava')
const { connect } = require('mongodb')
const fetch = require('node-fetch')
const io = require('socket.io-client')
const { OrderStore } = require('../models/order')

const mongoConfig = {
  url: process.env.MONGO_URL,
  options: {
    autoReconnect: true,
    reconnectTries: 10,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
}
const { WAITER_URL } = process.env

test.before(async t => {
  const mongoClient = await connect(
    mongoConfig.url,
    mongoConfig.options,
  )
  const db = mongoClient.db()

  const orderStore = new OrderStore(db)

  t.context = {
    mongoClient,
    orderStore,
  }
})

test.after.always(async t => {
  await t.context.mongoClient.close()
})

function newOrderRequest() {
  return fetch(`${WAITER_URL}/order`, {
    method: 'post',
    body: JSON.stringify({
      order: {
        pizzas: [
          {
            ingridients: ['cheese', 'tomato'],
          },
        ],
      },
    }),
    headers: { 'Content-Type': 'application/json' },
  }).then(res => res.json())
}

test.serial('creates new order', async t => {
  const prevCount = await t.context.orderStore.collection.countDocuments()
  const res = await newOrderRequest()
  t.truthy(res.id)
  const newCount = await t.context.orderStore.collection.countDocuments()
  t.is(newCount, prevCount + 1)
  const doc = await t.context.orderStore.getById(res.id)
  t.true(doc.status == 'in_progress')
})

test.only('socket connection', async t => {
  const socket = io(WAITER_URL)
  socket.disconnect()
  t.pass()
})
