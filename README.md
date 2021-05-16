# Yamnick

Yamnick is a real-time collaboration diagramming tool built with [react], [express] and [socket.io]. See [demo].

# Prerequisites

Server uses [nodemon] to provide runtime dev configuration,
your Web/nodemon.json should look like this

```sh
{
  "watch": ["src/server/"],
  "env": {
    "DEV": true,
    "HEROKU_POSTGRESQL_ONYX_URL": "",
    "AUTH0_CLIENT_SECRET": ""
  }
}
```

# Running

```sh
cd Web
npm install
npm run dev
```

# Deployment (heroku)

The app is [dockerized] and currently runs on heroku

```sh
docker build --no-cache -t registry.heroku.com/your_heroku_app_name/web . && docker image prune -f && heroku container:push web -a your_heroku_app_name && heroku container:release web -a your_heroku_app_name
```

# Persistence

Application uses [nact] and persists to [postgresql] with custom [persistence engine]

# Tests

[jest] is used for unit testing

[![Node.js CI](https://github.com/detoix/yamnick/actions/workflows/node.js.yml/badge.svg)](https://github.com/detoix/yamnick/actions/workflows/node.js.yml)

```sh
npm run test
npm run test-silent
```

[demo]: <https://secure-brushlands-76941.herokuapp.com>
[react]: <https://reactjs.org>
[express]: <https://expressjs.com>
[postgresql]: <https://www.postgresql.org>
[socket.io]: <https://socket.io>
[persistence engine]: <https://github.com/detoix/yamnick/blob/master/Web/src/server/persistence.js>
[nact]: <https://nact.io>
[dockerized]: <https://github.com/detoix/yamnick/blob/master/Web/Dockerfile>
[nodemon]: <https://nodemon.io>
[jest]: <https://jestjs.io>