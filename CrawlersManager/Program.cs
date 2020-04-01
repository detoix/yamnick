using System;
using System.Text;
using System.Text.Json;
using Akka.Actor;
using Contracts;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace CrawlersManager
{
    class Program
    {
        static void Main(string[] args)
        {
            var factory = new ConnectionFactory() 
            {
                Uri = new Uri(args[0])
            };
            using(var connection = factory.CreateConnection())
            using(var channel = connection.CreateModel())
            using (var system = ActorSystem.Create("System"))
            {
                SendUntyped sendUntyped = (chanell, message, replyTo) =>
                {
                    var props = channel.CreateBasicProperties();
                    if (!string.IsNullOrEmpty(replyTo))
                        props.ReplyTo = replyTo;
                    channel.BasicPublish(
                        exchange: string.Empty,
                        routingKey: chanell,
                        basicProperties: props,
                        body: Encoding.UTF8.GetBytes(message));
                };

                SendTyped sendTyped = (chanell, message, replyTo) =>
                {
                    var props = channel.CreateBasicProperties();
                    if (!string.IsNullOrEmpty(replyTo))
                        props.ReplyTo = replyTo;
                    channel.BasicPublish(
                        exchange: string.Empty,
                        routingKey: chanell,
                        basicProperties: props,
                        body: message.ToByteArray());
                };

                var actor = system.ActorOf(
                    Props.Create<RootActor>(sendUntyped, sendTyped));
                var clientCommandsConsumer = new EventingBasicConsumer(channel);
                clientCommandsConsumer.Received += (model, ea) => 
                {
                    var serialized = Encoding.UTF8.GetString(ea.Body);
                    var message = JsonSerializer.Deserialize<TypedMessage>(serialized, new  JsonSerializerOptions()
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });
                    message.ReplyTo = ea.BasicProperties.ReplyTo;
                    actor.Tell(message);
                };
                channel.BasicConsume(
                    queue: "ClientCommands", 
                    autoAck: true,
                    consumer: clientCommandsConsumer);
                var typedMessageConsumer = new EventingBasicConsumer(channel);
                typedMessageConsumer.Received += (model, ea) => actor.Tell(ea.Body.ToObject());
                channel.BasicConsume(
                    queue: "TypedMessage", 
                    autoAck: true, 
                    consumer: typedMessageConsumer);

                do
                {
                    
                } while (true);
            }
        }
    }

    delegate void SendUntyped(string channel, string message, string replyTo);
    delegate void SendTyped(string channel, object message, string replyTo);

    class RootActor : ReceiveActor
    {
        private SendUntyped SendUntyped { get; }
        private SendTyped SendTyped { get; }

        public RootActor(
            SendUntyped sendUntyped,
            SendTyped sendTyped)
        {
            this.SendUntyped = sendUntyped;
            this.SendTyped = sendTyped;

            this.Receive<TypedMessage>(args =>
            {
                if (args.CrawlCommand != null)
                {
                    System.Console.WriteLine($"Received {nameof(args.CrawlCommand)} with reply to {args.ReplyTo}, forwarding to self...");
                    args.CrawlCommand.ReplyTo = args.ReplyTo;
                    this.Self.Forward(args.CrawlCommand);
                }
            });

            this.Receive<CrawlCommand>(args => 
            {
                System.Console.WriteLine($"Processing {args}");

                var message = JsonSerializer.Serialize(args, new JsonSerializerOptions()
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                this.SendUntyped("crawl_queue", message, args.ReplyTo);
            });
        }
    }
}
