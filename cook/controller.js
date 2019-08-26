
class Controller {
  constructor(orderStore, rabbitChannel) {
    this.orderStore = orderStore
    this.rabbitChannel = rabbitChannel
  }

  async processOrder(msg) {
    const orderId = msg.content.toString()
    console.log(` received ${JSON.stringify(orderId)}`)
    const timeToCook = Math.floor(Math.random() * 4 + 1) // 1-5s
    setTimeout(() => {
      console.log(` done ${JSON.stringify(orderId)} in ${timeToCook}s`)
      this.rabbitChannel.ack(msg)
    }, timeToCook * 1000)
  }
}

module.exports = { Controller }
