using Akka.Actor;
using Contracts;
using System.Text.Json;

namespace CrawlersManager.Actors
{
    delegate void Send(string channel, string message, string replyTo);

    class GatewayActor : ReceiveActor
    {
        private IActorRef PersistenceManager { get; }
        private Send Send { get; }

        public GatewayActor(
            IActorRef persistenceManager,
            Send send)
        {
            this.PersistenceManager = persistenceManager;
            this.Send = send;

            this.Receive<TypedMessage>(args =>
            {
                System.Console.WriteLine($"{nameof(GatewayActor)} processing {args} of {args.Id} by {args.ReplyTo}");
                
                if (args.QueryForDiagram != null)
                {
                    args.QueryForDiagram.ReplyTo = args.ReplyTo;
                    this.Self.Forward(args.QueryForDiagram);
                }
                else if (args.Diagram != null)
                {
                    args.Diagram.ReplyTo = args.ReplyTo;
                    this.Self.Forward(args.Diagram);
                }
                else
                {
                    System.Console.WriteLine("Unknown message received");
                }
            });

            this.Receive<QueryFor<Diagram>>(args =>
            {
                System.Console.WriteLine($"{nameof(GatewayActor)} processing {args} of {args.Id} by {args.ReplyTo}");
                
                this.PersistenceManager.Tell(args);
            });

            this.Receive<Diagram>(args => 
            {
                System.Console.WriteLine($"{nameof(GatewayActor)} processing {args} of {args.Id} by {args.ReplyTo}");

                this.PersistenceManager.Tell(args);
            });

            this.Receive<Persisted<Diagram>>(args =>
            {
                System.Console.WriteLine($"{nameof(GatewayActor)} processing {args} of {args.Id} by {args.ReplyTo}");

                var message = JsonSerializer.Serialize(args.Content, new JsonSerializerOptions()
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                this.Send(args.Content.ReplyTo, message, string.Empty);
            });
        }
    }
}