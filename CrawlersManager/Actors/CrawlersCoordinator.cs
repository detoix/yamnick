using Akka.Actor;
using Contracts;
using CrawlersManager.Events;
using System.Text.Json;

namespace CrawlersManager.Actors
{
    delegate void Send(string channel, string message, string replyTo);

    class CrawlersCoordinator : ReceiveActor
    {
        private IActorRef PersistenceManager { get; }
        private Send Send { get; }

        public CrawlersCoordinator(
            IActorRef persistenceManager,
            Send send)
        {
            this.PersistenceManager = persistenceManager;
            this.Send = send;

            this.Receive<TypedMessage>(args =>
            {
                System.Console.WriteLine($"{nameof(CrawlersCoordinator)} processing {args} of {args.Id} by {args.ReplyTo}");

                if (args.CrawlCommand != null)
                {
                    args.CrawlCommand.ReplyTo = args.ReplyTo;
                    this.Self.Forward(args.CrawlCommand);
                }
                else if (args.CrawlResults != null)
                {
                    args.CrawlResults.ReplyTo = args.ReplyTo;
                    this.Self.Forward(args.CrawlResults);
                }
                else if (args.QueryForUser != null)
                {
                    args.QueryForUser.ReplyTo = args.ReplyTo;
                    this.Self.Forward(args.QueryForUser);
                }
                else if (args.RemoveQuery != null)
                {
                    args.RemoveQuery.ReplyTo = args.ReplyTo;
                    this.Self.Forward(args.RemoveQuery);
                }
            });

            this.Receive<QueryForUser>(args =>
            {
                System.Console.WriteLine($"{nameof(CrawlersCoordinator)} processing {args} of {args.Id} by {args.ReplyTo}");
                
                this.PersistenceManager.Tell(args);
            });

            this.Receive<CrawlCommand>(args => 
            {
                System.Console.WriteLine($"{nameof(CrawlersCoordinator)} processing {args} of {args.Id} by {args.ReplyTo}");

                this.PersistenceManager.Tell(args);
            });

            this.Receive<CrawlCommandPersisted>(args =>
            {
                System.Console.WriteLine($"{nameof(CrawlersCoordinator)} processing {args} of {args.CrawlCommand.Id} by {args.CrawlCommand.ReplyTo}");

                var message = JsonSerializer.Serialize(args.CrawlCommand, new JsonSerializerOptions()
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                this.Send("crawl_queue", message, args.CrawlCommand.ReplyTo);
            });

            this.Receive<CrawlResults>(args =>
            {
                System.Console.WriteLine($"{nameof(CrawlersCoordinator)} processing {args} of {args.Id} by {args.ReplyTo}");
                
                this.PersistenceManager.Tell(args);
            });

            this.Receive<User>(args => 
            {
                System.Console.WriteLine($"{nameof(CrawlersCoordinator)} processing {args} of {args.Id} by {args.ReplyTo}");

                var message = JsonSerializer.Serialize(args, new JsonSerializerOptions()
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                this.Send(args.ReplyTo, message, string.Empty);
            });
        
            this.Receive<RemoveQuery>(args =>
            {
                System.Console.WriteLine($"{nameof(CrawlersCoordinator)} processing {args} of {args.Id} by {args.ReplyTo}");

                this.PersistenceManager.Tell(args);
            });

            Context.System.EventStream.Subscribe(this.Self, typeof(QueryRemoved));
            this.Receive<QueryRemoved>(args =>
            {
                System.Console.WriteLine($"{nameof(CrawlersCoordinator)} processing {args} of {args.Id} by {args.ReplyTo}");

                this.Self.Tell(new QueryForUser() { ReplyTo = args.ReplyTo });
            });
        }
    }
}