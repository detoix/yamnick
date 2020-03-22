using System;
using System.Threading.Tasks;
using Akka.Actor;
using Contracts;
using Microsoft.AspNetCore.SignalR;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Some
{
    class Program
    {
        static void Main(string[] args)
        {
            var factory = new ConnectionFactory() 
            { 
                Uri = new Uri(args[0])
                // Uri = new Uri("amqps://wenivnjk:qfIQwrfK2nA8oe9pe_i2F_KsVhZwnXWd@bear.rmq.cloudamqp.com/wenivnjk")
            };
            using(var connection = factory.CreateConnection())
            using(var channel = connection.CreateModel())
            using (var remoteSystem = ActorSystem.Create("System"))
            {
                var actor = remoteSystem.ActorOf(Props.Create<BaseActor>());
                foreach (var type in new[] { nameof(MessageToDeliver) })
                {
                    channel.QueueDeclare(queue: type,
                                    durable: false,
                                    exclusive: false,
                                    autoDelete: false,
                                    arguments: null);

                    var consumer = new EventingBasicConsumer(channel);
                    consumer.Received += 
                        (model, ea) => actor.Tell(ea.Body.ToObject());
                    channel.BasicConsume(queue: type,
                                        autoAck: true,
                                        consumer: consumer);
                }

                do
                {
                    
                } while (true);
            }
        }
    }

    class BaseActor : ReceiveActor
    {
        public BaseActor()
        {
            this.Receive<MessageToDeliver>(args => 
            {
                System.Console.WriteLine(args.Data);
            });
        }
    }

    public class ChatHub : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}
