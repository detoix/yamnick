using System;
using System.Text;
using Akka.Actor;
using Contracts;
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
            };
            using(var connection = factory.CreateConnection())
            using(var channel = connection.CreateModel())
            using (var system = ActorSystem.Create("System"))
            {
                Action<string> respondUntyped = content =>
                {
                    channel.BasicPublish(exchange: "",
                        routingKey: "ResponsesToClient",
                        basicProperties: null,
                        body: Encoding.UTF8.GetBytes(content));
                };

                Action<object> respondTyped = content =>
                {
                    channel.BasicPublish(exchange: "",
                        routingKey: "TypedMessage",
                        basicProperties: null,
                        body: content.ToByteArray());
                };

                var actor = system.ActorOf(
                    Props.Create<RootActor>(respondUntyped, respondTyped));
                var clientCommandsConsumer = new EventingBasicConsumer(channel);
                clientCommandsConsumer.Received += (model, ea) => 
                {
                    actor.Tell(Encoding.UTF8.GetString(ea.Body));
                };
                channel.BasicConsume(queue: "ClientCommands",
                                    autoAck: true,
                                    consumer: clientCommandsConsumer);
                var typedMessageConsumer = new EventingBasicConsumer(channel);
                typedMessageConsumer.Received += (model, ea) => actor.Tell(ea.Body.ToObject());
                channel.BasicConsume(queue: "TypedMessage",
                                    autoAck: true,
                                    consumer: typedMessageConsumer);

                do
                {
                    
                } while (true);
            }
        }
    }

    class RootActor : ReceiveActor
    {
        private Action<string> RespondUntyped { get; }
        private Action<object> RespondTyped { get; }

        public RootActor(
            Action<string> respondUntyped,
            Action<object> respondTyped)
        {
            this.RespondUntyped = respondUntyped;
            this.RespondTyped = respondTyped;

            this.Receive<MessageToDeliver>(args => 
            {
                System.Console.WriteLine("REAL" + args.Data);
            });
            this.Receive<string>(args =>
            {
                System.Console.WriteLine($"Server received message of {args}");
                this.RespondUntyped("Some basic response");
            });
        }
    }
}
