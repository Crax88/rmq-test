# rmq-test

Test task with RabbitMQ and NodeJS

## Development start

To start project follow tis steps:

1. install [Docker](https://www.docker.com/) and [Docker-compose](https://docs.docker.com/compose/)
2. Clone the repository
3. `cd` into project directory
4. Inside project directory run `cp .env.sample .env`
5. Inside project directory run `docker-compose up`
6. To run basic test `curl -d '{"text":"This should be reversed"}' -H "Content-Type: application/json" -X POST http://localhost:4000/api/messages`
7. To remove things related to Docker run `docker-compose down --rmi local -v` inside project directory

## Todos

- Add more logs
- Add request tracing?
- Add something like Portainer and maybe Grafana
