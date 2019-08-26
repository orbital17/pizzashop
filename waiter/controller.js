
class Controller {
  constructor(orderStore) {
    this.orderStore = orderStore
  }

  async createOrder(req, res) {
    const { order } = req.body
    const id = await this.orderStore.createOrder(order)
    res.json({
      id
    })
  }
}

module.exports = { Controller }
