
const { Kafka } = require('kafkajs');
const logger = require('../utils/logger');

let kafka = null;
let producer = null;
let consumer = null;

async function connectKafka() {
  try {
    const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
    
    kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'inventory-service',
      brokers: brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    logger.info(`✅ Kafka connected to ${brokers.join(',')}`);
    return kafka;

  } catch (error) {
    logger.warn('⚠️ Kafka connection failed:', error.message);
    return null;
  }
}

async function getProducer() {
  if (!producer && kafka) {
    producer = kafka.producer();
    await producer.connect();
    logger.info('✅ Kafka producer connected');
  }
  return producer;
}

async function sendEvent(topic, event) {
  try {
    const producer = await getProducer();
    if (!producer) return false;
    
    await producer.send({
      topic,
      messages: [{
        key: event.orderId?.toString() || event.productId?.toString(),
        value: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
          service: 'inventory-service'
        })
      }]
    });
    
    logger.info(`📤 Event sent to ${topic}:`, { eventType: event.type });
    return true;
    
  } catch (error) {
    logger.error('Failed to send event:', error);
    return false;
  }
}

async function consumeEvents(topics, messageHandler) {
  if (!kafka) {
    logger.warn('Kafka not available, skipping consumer');
    return;
  }
  
  consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID || 'inventory-group' });
  await consumer.connect();
  await consumer.subscribe({ topics, fromBeginning: false });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const value = JSON.parse(message.value.toString());
        logger.debug(`📥 Received event from ${topic}:`, value);
        await messageHandler(topic, value);
      } catch (error) {
        logger.error('Error processing message:', error);
      }
    }
  });
  
  logger.info(`🎧 Listening to topics: ${topics.join(', ')}`);
}

module.exports = { connectKafka, sendEvent, consumeEvents };
