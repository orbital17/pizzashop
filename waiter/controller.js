const EventEmitter = require('events')

class Controller {
  constructor(orderStore, rabbitChannel, io) {
    this.orderStore = orderStore
    this.rabbitChannel = rabbitChannel
    this.io = io
    this.orderReadyEmitter = new EventEmitter()
  }

  async createOrderEndpoint(req, res) {
    const { order } = req.body
    const result = await this.createOrder(order)
    res.json(result)
  }

  async createOrder(order) {
    const orderRecord = await this.orderStore.createOrder(order)
    const orderId = orderRecord._id
    this.rabbitChannel.sendToQueue(
      'newOrders',
      Buffer.from(orderId.toString()),
      { persistent: true },
    )
    console.log(` order created ${orderId}`)
    return {
      id: orderId,
    }
  }

  async orderStatus(req, res) {
    const { id } = req.params
    const order = await this.orderStore.getById(id)
    res.json({
      status: order.status,
    })
  }

  async subscribeOrderReady(socket, orderId) {
    const listener = () => {
      socket.emit('ready', orderId)
      socket.disconnect()
    }
    this.orderReadyEmitter.once(orderId, listener)
    socket.on('disconnect', () => {
      this.orderReadyEmitter.removeListener(orderId, listener)
    })
    socket.emit('info', `listening to ${orderId}`)
  }

  async socketConnection(socket) {
    console.log(` socket connected ${socket.id}`)
    socket.on('disconnect', () => {
      console.log(` socket disconnected ${socket.id}`)
    })

    socket.on('subscribe', orderId => {
      this.subscribeOrderReady(socket, orderId)
    })

    socket.on('createOrder', async order => {
      const result = await this.createOrder(order)
      if (result.id) {
        this.subscribeOrderReady(socket, result.id)
      }
    })
  }

  async orderReady(msg) {
    const orderId = msg.content.toString()
    console.log(` order ready ${orderId}`)
    this.orderReadyEmitter.emit(orderId)
    this.rabbitChannel.ack(msg)
  }
}

module.exports = { Controller }
