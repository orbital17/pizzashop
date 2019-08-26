
class Controller {
  constructor(orderStore, rabbitChannel) {
    this.orderStore = orderStore
    this.rabbitChannel = rabbitChannel
  }

  async processOrder(msg) {
    const orderId = msg.content.toString()
    console.log(` received ${JSON.stringify(orderId)}`)
    this.rabbitChannel.ack(msg)
  }
}

module.exports = { Controller }
