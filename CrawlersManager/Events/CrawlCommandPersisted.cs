using Contracts;

namespace CrawlersManager.Events
{
    public class CrawlCommandPersisted : Message
    {
        public CrawlCommandPersisted(CrawlCommand crawlCommand)
        {
            Id = crawlCommand.Id;
            ReplyTo = crawlCommand.ReplyTo;
            CrawlCommand = crawlCommand;
        }

        public CrawlCommand CrawlCommand { get; }
    }
}