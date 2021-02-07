# Yamnick

Yamnick is a real-time collaboration diagramming tool built with react, express and socket.io. 

# Running

```sh
cd Web
npm install
npm run dev
```

# Deployment (heroku)

The app is [dockerized] and currently run on heroku
Assuming your heroku app name as _your_heroku_app_name_

```sh
docker build --no-cache -t registry.heroku.com/your_heroku_app_name/web . && docker image prune -f && heroku container:push web -a your_heroku_app_name && heroku container:release web -a your_heroku_app_name
```

# Persistence

Application uses [nact] and persists to postgresql document db via custom [persistence engine]

# Configuration

Server uses nodemon to provide runtime configuration
Web/nodemon.json

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

[persistence engine]: <https://github.com/detoix/yamnick/blob/master/Web/src/server/persistence.js>
[nact]: <https://nact.io>
[dockerized]: <https://github.com/detoix/yamnick/blob/master/Web/Dockerfile>