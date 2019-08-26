const { ObjectId } = require('mongodb')

class OrderStore {
  constructor(db) {
    this.db = db
    this.collection = this.db.collection('orders')
  }

  async createOrder(order) {
    const result = await this.collection.insertOne({
      status: 'in_queue',
      order
    })
    return result.ops[0]
  }

  async setStatus(id, newStatus) {
    await this.collection.updateOne(
      {
        _id: ObjectId(id)
      },
      {
        $set: {
          status: newStatus
        }
      }
    )
  }
}

module.exports = { OrderStore }
