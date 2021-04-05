# Encodot Api

Create encodot network: `docker network create encodot-net`

Create encodot database volume: `docker volume create encodot-db-vol`

Run database container: `docker run --name encodot-db -e POSTGRES_USER=encodot -e POSTGRES_PASSWORD=encodot -e POSTGRES_DB=encodot -v encodot-db-vol:/var/lib/postgresql/data --network encodot-net -d postgres:13.2-alpine`

Build api image: `docker image build --target development -t encodot-api .`

Run api container: `docker container run --network encodot-net -p 3000:3000 --name encodot-api -e NODE_ENV=development encodot-api npm run start:dev`
