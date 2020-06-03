using System;
using System.Linq;
using System.Text;
using System.Text.Json;
using Akka.Actor;
using Contracts;
using Marten;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace CrawlersManager
{
    class Program
    {
        static void Main(string[] args)
        {
            System.Console.WriteLine(
                $"Starting up with args of: {string.Join(" ", args)}");

            using (var store = DocumentStore.For(PersistenceManager.ValidConnectionStringFrom(args[0])))
            using (var connection = new RabbitMQ.Client.ConnectionFactory() { Uri = new Uri(args[1]) }.CreateConnection())
            using (var channel = connection.CreateModel())
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

                var persistenceManager = system.ActorOf(
                    Props.Create<PersistenceManager>(store));
                var actor = system.ActorOf(
                    Props.Create<CrawlersCoordinator>(persistenceManager, sendUntyped, sendTyped));
                var clientCommandsConsumer = new EventingBasicConsumer(channel);
                clientCommandsConsumer.Received += (model, ea) => 
                {
                    var serialized = Encoding.UTF8.GetString(ea.Body);
                    System.Console.WriteLine($"System received message of {serialized}");
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
}
