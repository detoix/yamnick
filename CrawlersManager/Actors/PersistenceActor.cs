using System.Collections.Generic;
using System.Linq;
using Akka.Actor;
using Contracts;
using Marten;

namespace CrawlersManager.Actors
{
    class PersistenceActor : ReceiveActor
    {
        private IDocumentStore Store { get; }

        public PersistenceActor(
            IDocumentStore store)
        {
            this.Store = store;

            this.Receive<QueryFor<Diagram>>(args =>
            {
                System.Console.WriteLine($"{nameof(PersistenceActor)} processing {args} of {args.Id} by {args.ReplyTo}");

                using (var session = store.OpenSession())
                {
                    var existingDiagram = session
                        .Query<Diagram>()
                        .Where(x => x.ReplyTo == args.ReplyTo)
                        .SingleOrDefault();

                    if (existingDiagram is null)
                    {
                        System.Console.WriteLine($"Diagram of {args.ReplyTo} not found");
                    }
                    else
                    {
                        System.Console.WriteLine($"Diagram of {args.ReplyTo} found, forwarding...");

                        this.Sender.Tell(new Persisted<Diagram>()
                        {
                            Content = existingDiagram
                        });
                    }
                }
            });

            this.Receive<Diagram>(args =>
            {
                System.Console.WriteLine($"{nameof(PersistenceActor)} processing {args} of {args.Id} by {args.ReplyTo}");

                using (var session = store.OpenSession())
                {
                    var existingDiagram = session
                        .Query<Diagram>()
                        .Where(x => x.ReplyTo == args.ReplyTo)
                        .SingleOrDefault();
                    
                    if (existingDiagram is null)
                    {
                        System.Console.WriteLine($"Creating new diagram of {args.ReplyTo}");

                        var availableId = 1;
                        foreach (var entity in args.ClassDefinitions)
                        {
                            entity.Id = availableId;
                            availableId++;
                        }

                        session.Store(args);
                        session.SaveChanges();

                        this.Sender.Tell(new Persisted<Diagram>()
                        {
                            Content = args
                        });
                    }
                    else
                    {
                        var availableId = args.ClassDefinitions.Max(e => e.Id) + 1;

                        foreach (var entity in args.ClassDefinitions)
                        {
                            if (entity.Id == 0)
                            {
                                entity.Id = availableId;
                                availableId++;
                            }
                        }

                        existingDiagram.ClassDefinitions = args.ClassDefinitions;
                        existingDiagram.Relations = args.Relations;

                        session.Store(existingDiagram);
                        session.SaveChanges();

                        this.Sender.Tell(new Persisted<Diagram>()
                        {
                            Content = existingDiagram
                        });
                    }
                }
            });
        }

        protected override void PreStart()
        {
            using (var session = this.Store.OpenSession())
            {
                session.Store<Diagram>();
                session.SaveChanges();
            }
        }
    }
}