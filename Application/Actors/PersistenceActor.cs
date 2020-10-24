using System.Collections.Generic;
using System.Linq;
using Akka.Actor;
using Contracts;
using Marten;

namespace Application.Actors
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
                        .Where(x => x.Id == args.Id)
                        .SingleOrDefault();

                    if (existingDiagram is null)
                    {
                        System.Console.WriteLine($"Diagram of Id {args.Id} not found");

                        this.Sender.Tell(new NotFound<Diagram>());
                    }
                    else
                    {
                        System.Console.WriteLine($"Diagram of Id {args.Id} found, forwarding...");

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
                        .Where(x => x.Id == args.Id)
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
                        System.Console.WriteLine($"Found existing diagram of {args.ReplyTo}");

                        var availableId = args.ClassDefinitions
                            .Select(e => e.Id)
                            .DefaultIfEmpty(0)
                            .Max() + 1;

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