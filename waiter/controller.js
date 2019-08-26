
class Controller {
  constructor(orderStore) {
    this.orderStore = orderStore
  }

  async createOrder(req, res) {
    const { order } = req.body
    const orderRecord = await this.orderStore.createOrder(order)
    res.json({
      id: orderRecord._id
    })
  }
}

module.exports = { Controller }
