# Encodot Api

[![Build Status](https://dev.azure.com/sheepr4ider/encodot-api/_apis/build/status/xpl0t.encodot-api?branchName=release%2Fprod)](https://dev.azure.com/sheepr4ider/encodot-api/_build/latest?definitionId=10&branchName=release%2Fprod)

REST api for the encodot project.

## Run api

Prerequisites:
- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/en/)

Run database container: `docker run --name encodot-db -e POSTGRES_USER=encodot -e POSTGRES_PASSWORD=encodot -e POSTGRES_DB=encodot -p 5432:5432 -d postgres:13.2-alpine`

Install npm packages: `npm install`

Run api: `npm run start:dev`

## Call endpoints

While the rest api is running, you can call endpoints via swagger at [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger)
