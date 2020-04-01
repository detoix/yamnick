FROM mcr.microsoft.com/dotnet/core/runtime:3.1
COPY publish/ publish/
CMD dotnet publish/CrawlersManager.dll $DATABASE_URL $AMQPURL