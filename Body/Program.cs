using System;
using System.Text;
using Contracts;
using RabbitMQ.Client;

namespace Body
{
    class Program
    {
        static void Main(string[] args)
        {
            var message = new MessageToDeliver() { Data = "dupa1" };
            var factory = new ConnectionFactory() 
            { 
                Uri = new Uri(args[0])
                // Uri = new Uri("amqps://wenivnjk:qfIQwrfK2nA8oe9pe_i2F_KsVhZwnXWd@bear.rmq.cloudamqp.com/wenivnjk")
            };
            using(var connection = factory.CreateConnection())
            using(var channel = connection.CreateModel())
            {
                channel.QueueDeclare(queue: nameof(MessageToDeliver),
                                    durable: false,
                                    exclusive: false,
                                    autoDelete: false,
                                    arguments: null);

                channel.BasicPublish(exchange: "",
                                    routingKey: nameof(MessageToDeliver),
                                    basicProperties: null,
                                    body: message.ToByteArray());
                Console.WriteLine(" [x] Sent {0}", message);
            }
        }
    }
}
