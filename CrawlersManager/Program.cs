using System;
using System.Linq;
using System.Text;
using System.Text.Json;
using Akka.Actor;
using Contracts;
using CrawlersManager.Actors;
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

            using (var store = DocumentStore.For(ValidConnectionStringFrom(args[0])))
            using (var connection = new RabbitMQ.Client.ConnectionFactory() { Uri = new Uri(args[1]) }.CreateConnection())
            using (var channel = connection.CreateModel())
            using (var system = ActorSystem.Create("System"))
            {
                Send send = (channelName, message, replyTo) =>
                {
                    var props = channel.CreateBasicProperties();
                    if (!string.IsNullOrEmpty(replyTo))
                        props.ReplyTo = replyTo;
                    channel.BasicPublish(
                        exchange: string.Empty,
                        routingKey: channelName,
                        basicProperties: props,
                        body: Encoding.UTF8.GetBytes(message));
                };

                var persistenceManager = system.ActorOf(
                    Props.Create<PersistenceManager>(store));
                var coordinator = system.ActorOf(
                    Props.Create<CrawlersCoordinator>(persistenceManager, send));
                var router = new EventingBasicConsumer(channel);
                router.Received += (model, ea) => 
                {
                    var serialized = Encoding.UTF8.GetString(ea.Body);
                    System.Console.WriteLine($"System received message of {serialized}");
                    var message = JsonSerializer.Deserialize<TypedMessage>(serialized, new  JsonSerializerOptions()
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });
                    message.ReplyTo = ea.BasicProperties.ReplyTo;
                    coordinator.Tell(message);
                };
                var taskQueueName = "task_queue";
                channel.QueueDeclare(taskQueueName, durable: true);
                channel.BasicConsume(
                    queue: taskQueueName, 
                    autoAck: true,
                    consumer: router);

                do
                {
                    
                } while (true);
            }
        }

        static string ValidConnectionStringFrom(string connectionString)
        {
            if (!connectionString.StartsWith("postgres"))
            {
                return connectionString;
            }
            else
            {
                var delimiterChars = new[] { '/', ':', '@', '?' };
                var strConn = connectionString.Replace("//", "").Split(delimiterChars).Where(x => !string.IsNullOrEmpty(x)).ToArray();
                var user = strConn[1];
                var pass = strConn[2];
                var server = strConn[3];
                var database = strConn[5];
                var port = strConn[4];
                
                return $"Server={server};Port={port};Database={database};User Id={user};Password={pass};sslmode=Require;Trust Server Certificate=true";
            }
        }
    }
}