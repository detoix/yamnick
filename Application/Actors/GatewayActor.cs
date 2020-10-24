using Akka.Actor;
using Contracts;
using System.Collections.Generic;
using System.Text.Json;

namespace Application.Actors
{
    delegate void Send(string channel, string message, string replyTo);

    class GatewayActor : ReceiveActor
    {
        private IActorRef PersistenceManager { get; }
        private IDictionary<int, IActorRef> Diagrams { get; }
        private Send Send { get; }

        public GatewayActor(
            IActorRef persistenceManager,
            Send send)
        {
            this.Diagrams = new Dictionary<int, IActorRef>();
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

                if (this.Diagrams.TryGetValue(args.Id, out var diagram))
                {
                    diagram.Tell(args);
                }
                else
                {
                    var newDiagram = Context.ActorOf(
                        Props.Create<DiagramActor>(args.Id, this.PersistenceManager));
                    this.Diagrams.Add(args.Id, newDiagram);
                    newDiagram.Tell(args);
                }
            });

            this.Receive<Diagram>(args => 
            {
                System.Console.WriteLine($"{nameof(GatewayActor)} processing {args} of {args.Id} by {args.ReplyTo}");

                if (this.Diagrams.TryGetValue(args.Id, out var diagram))
                {
                    diagram.Tell(args);
                }
                else
                {
                    var newDiagram = Context.ActorOf(
                        Props.Create<DiagramActor>(args.Id, this.PersistenceManager));
                    this.Diagrams.Add(args.Id, newDiagram);
                    newDiagram.Tell(args);
                }
            });

            Context.Dispatcher.EventStream.Subscribe(this.Self, typeof(Persisted<Diagram>));
            this.Receive<Persisted<Diagram>>(args =>
            {
                System.Console.WriteLine($"{nameof(GatewayActor)} processing {args} of {args.Id} by {args.Content.ReplyTo}");

                var message = JsonSerializer.Serialize(args.Content, new JsonSerializerOptions()
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                this.Send(args.Content.ReplyTo, message, string.Empty);
            });
        }
    }
}