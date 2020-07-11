Web
===========================================

*   Establishes communication between client, server and crawlers manager
*   Provides real-time data using websockets

Technology stack
----------------------

.. literalinclude:: ../Web/package.json
   :linenos:

Client
----------------------

*   React application using websockets
*   Provides security using external Auth0 provider

.. literalinclude:: ../Web/src/client/App.js
   :linenos:

Server
----------------------

*   Establishes authenthication, authorization and communication with client using websockets
*   Forwards messages from RabbitMQ queue, one queue per connection

.. literalinclude:: ../Web/src/server/index.js
   :language: js
   :linenos: