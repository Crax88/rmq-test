import { connect } from "amqplib";

function processMessage(msg: string) {
  return msg.split("").reverse().join("");
}

const incomeQueue = "messagesProcess";

(async () => {
  const connection = await connect({
    hostname: process.env.RABBIT_HOST,
    port: Number(process.env.RABBIT_PORT),
    username: process.env.RABBIT_USER,
    password: process.env.RABBIT_PASSWORD,
    protocol: "amqp",
    heartbeat: 60,
  });
  const channel = await connection.createChannel();
  channel.prefetch(1);
  process.once("SIGINT", async () => {
    console.log("got sigint, closing connection");
    await channel.close();
    await connection.close();
    process.exit(0);
  });
  await channel.consume(incomeQueue, async (msg) => {
    if (msg) {
      console.log("processing messages");
      const parsed = JSON.parse(msg.content.toString());
      const processedMessage = processMessage(parsed.message);
      channel.publish(
        "messages",
        `outcome_message.${parsed.id}`,
        Buffer.from(
          JSON.stringify({ id: parsed.id, message: processedMessage })
        )
      );
      channel.ack(msg);
    }
  });
  console.log(" [*] Waiting for messages.");
})();
