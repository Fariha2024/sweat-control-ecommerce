
const { Kafka } = require('kafkajs');
const logger = require('../utils/logger');

let kafka = null;
let producer = null;

async function connectKafka() {
  try {
    const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
    
    kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'payment-service',
      brokers: brokers,
      retry: { initialRetryTime: 100, retries: 8 }
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
        key: event.orderId?.toString(),
        value: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
          service: 'payment-service'
        })
      }]
    });
    
    logger.info(`📤 Event sent to ${topic}:`, { orderId: event.orderId });
    return true;
  } catch (error) {
    logger.error('Failed to send event:', error);
    return false;
  }
}

module.exports = { connectKafka, sendEvent };
