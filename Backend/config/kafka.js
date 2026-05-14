const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'chat-mern-app',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
  // Add retry config to make it more resilient in dev environment
  retry: {
    initialRetryTime: 300,
    retries: 10
  }
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'chat-messages-group' });

const connectKafka = async () => {
  try {
    await producer.connect();
    console.log('✅ Kafka Producer connected');
    await consumer.connect();
    console.log('✅ Kafka Consumer connected');
  } catch (error) {
    console.error('❌ Kafka connection error', error);
  }
};

module.exports = { kafka, producer, consumer, connectKafka };
