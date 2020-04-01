using System.Linq;
using Akka.Actor;
using Contracts;
using Marten;

namespace CrawlersManager
{
    class PersistenceManager : ReceiveActor
    {
        private IDocumentStore Store { get; }

        public PersistenceManager(
            IDocumentStore store)
        {
            this.Store = store;

            this.Receive<CrawlResults>(args => 
            {
                System.Console.WriteLine($"Persisting {args}...");

                using (var session = store.LightweightSession())
                {
                    session.Store(args);
                    session.SaveChanges();
                }
            });
        }
        
        public static string ValidConnectionStringFrom(string connectionString)
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