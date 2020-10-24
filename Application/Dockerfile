FROM mcr.microsoft.com/dotnet/core/runtime:3.1
COPY publish/ publish/
CMD dotnet publish/Application.dll $DATABASE_URL $AMQPURL