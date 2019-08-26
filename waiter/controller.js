
class Controller {
  constructor(orderStore, rabbitChannel) {
    this.orderStore = orderStore
    this.rabbitChannel = rabbitChannel
  }

  async createOrder(req, res) {
    const { order } = req.body
    const orderRecord = await this.orderStore.createOrder(order)
    const orderId = orderRecord._id;
    res.json({
      id: orderId
    })
    this.rabbitChannel.sendToQueue('newOrders', Buffer.from(orderId.toString()))
  }
}

module.exports = { Controller }
