class Queue {
  constructor() {
    this.queue = [];
    this.maxSize = 3;
  }

  enqueue(item) {
    if (this.queue.length >= this.maxSize) {
      this.dequeue(); // Remove the first item if the queue is full
    }
    this.queue.push(item);
  }

  dequeue() {
    return this.queue.shift();
  }

  size() {
    return this.queue.length;
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  isFull() {
    return this.queue.length === this.maxSize;
  }

  peek() {
    return this.queue[0];
  }

  clear() {
    this.queue = [];
  }

  hasInOrder(...args) {
    let nowCountingSequentially = false;
    for (let item of this.queue) {
      if (args[0] === item) {
        nowCountingSequentially = true;
      }
      if (nowCountingSequentially && item === args[0]) {
        args.shift();
        if (!args.length) return true;
      }
    }

    return false;
  }
}