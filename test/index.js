const test = require('ava')
const { connect } = require('mongodb')
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

test.before(async t => {
  const mongoClient = await connect(mongoConfig.url, mongoConfig.options)
  const db = mongoClient.db()

  const orderStore = new OrderStore(db)

  t.context = {
    mongoClient,
    orderStore
  }
})

test.after.always(async t => {
  await t.context.mongoClient.close()
})

test('get existing order', async t => {
  const id = '5d63d991dee4aa40d7df2e63'
  const doc = await t.context.orderStore.getById(id)
  t.is(doc.status, 'ready')
})
