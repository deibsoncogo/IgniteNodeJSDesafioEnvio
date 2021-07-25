const express = require("express");
const { v4 } = require("uuid");

const app = express();

app.use(express.json());

const repositories = [];

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: v4(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repository);

  return response.status(201).json(repository);
});

app.get("/repositories", (request, response) => response.status(200).json(repositories));

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repositoryFind = repositories.find((repository) => repository.id === id);

  if (!repositoryFind) {
    return response.status(404).json({ error: "Repositório não encontrado!" });
  }

  if (repositoryFind.title !== title) {
    repositoryFind.title = title;
  }

  if (repositoryFind.url !== url) {
    repositoryFind.url = url;
  }

  if (repositoryFind.techs !== techs) {
    repositoryFind.techs = techs;
  }

  return response.status(201).json(repositoryFind);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex((repository) => repository.id === id);

  if (repositoryIndex < 0) {
    return response.status(404).json({ error: "Repositório não encontrado!" });
  }

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex((repository) => repository.id === id);

  if (repositoryIndex < 0) {
    return response.status(404).json({ error: "Repositório não encontrado" });
  }

  const likes = ++repositories[repositoryIndex].likes;

  return response.json({ likes });
});

module.exports = app;
