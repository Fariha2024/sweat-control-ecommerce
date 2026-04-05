
const { Kafka } = require('kafkajs');
const logger = require('../utils/logger');

let kafka = null;
let producer = null;
let consumer = null;

async function connectKafka() {
  try {
    const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
    
    kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'order-service',
      brokers: brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    logger.info(`✅ Kafka connected to ${brokers.join(',')}`);
    return kafka;

  } catch (error) {
    logger.error('❌ Kafka connection failed:', error);
    throw error;
  }
}

async function getProducer() {
  if (!producer) {
    producer = kafka.producer();
    await producer.connect();
    logger.info('✅ Kafka producer connected');
  }
  return producer;
}

async function getConsumer(groupId) {
  if (!consumer) {
    consumer = kafka.consumer({ groupId: groupId || process.env.KAFKA_GROUP_ID || 'order-group' });
    await consumer.connect();
    logger.info('✅ Kafka consumer connected');
  }
  return consumer;
}

async function sendEvent(topic, event, key = null) {
  try {
    const producer = await getProducer();
    
    await producer.send({
      topic,
      messages: [{
        key: key || event.orderId?.toString() || event.id?.toString(),
        value: JSON.stringify({
          ...event,
          timestamp: new Date().toISOString(),
          service: 'order-service'
        })
      }]
    });
    
    logger.info(`📤 Event sent to ${topic}:`, { eventType: event.type, orderId: event.orderId });
    return true;
    
  } catch (error) {
    logger.error('Failed to send event:', error);
    return false;
  }
}

async function consumeEvents(topics, messageHandler) {
  const consumer = await getConsumer();
  
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

module.exports = { connectKafka, sendEvent, consumeEvents, getProducer, getConsumer };
