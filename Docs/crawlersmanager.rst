Crawlers Manager
===========================================

*   Forwards messages from RabbitMQ to actors and other services
*   Establishes communication with database

Technology stack
----------------------

.. literalinclude:: ../CrawlersManager/CrawlersManager.csproj
   :language: xml
   :linenos:

Crawlers Coordinator
----------------------

*   Works like a router
*   Forwards messages from web to crawlers
*   Forwards messages from crawlers to web

.. literalinclude:: ../CrawlersManager/Actors/CrawlersCoordinator.cs
   :linenos:

Persistence Manager
----------------------

*   Communicates with Postgres DB using Marten

.. literalinclude:: ../CrawlersManager/Actors/PersistenceManager.cs
   :linenos: