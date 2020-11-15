FROM mcr.microsoft.com/dotnet/core/runtime:3.1
COPY publish/ publish/
EXPOSE $PORT
CMD dotnet publish/Application.dll $DATABASE_URL $PORT