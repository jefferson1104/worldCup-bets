<div align="center" style="margin-bottom: 20px;">
  <h1>Server (back-end)</h1>
  <p align="center">
    <img alt="technology" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
    <img alt="technology" src="https://img.shields.io/badge/fastify-202020?style=for-the-badge&logo=fastify&logoColor=white">
    <img alt="technology" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white">
    <img alt="technology" src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white">
    <img alt="technology" src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white">
  </p>
</div>

### About project
This is the back-end of the project, as the main technologies used for its development for Node.js, TypeScript, Fastify, Prisma and the database used is SQLite so you can choose another source to make changes. Below you have instructions on how to run this project on your local machine.

### Run project
```bash
# After cloning the project as a whole
# navigate to the server directory and start the commands below:

# install dependencies
$ npm install

# run/create a migration
$ npx prisma migrate dev

# run seed file to populate database
$ npx prisma db seed

# open prisma studio, a web database client
$ npx prisma studio

# start server
$ npm run dev
```
