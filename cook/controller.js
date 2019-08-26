
class Controller {
  constructor(orderStore, rabbitChannel) {
    this.orderStore = orderStore
    this.rabbitChannel = rabbitChannel
  }


  async processOrder(msg) {
    const orderId = msg.content.toString()
    console.log(` received ${JSON.stringify(orderId)}`)

    await this.orderStore.setStatus(orderId, 'in_progress')

    const timeToCook = Math.floor(Math.random() * 4 + 1) // 1-5s
    await new Promise((resolve) => setTimeout(resolve, timeToCook * 1000))

    console.log(` done ${JSON.stringify(orderId)} in ${timeToCook}s`)
    this.rabbitChannel.ack(msg)

    await this.orderStore.setStatus(orderId, 'ready')

    this.rabbitChannel.sendToQueue('readyOrders', Buffer.from(orderId), { persistent: true })
  }
}

module.exports = { Controller }
