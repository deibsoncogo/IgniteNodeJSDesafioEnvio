const express = require("express");
const cors = require("cors");
const { v4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function ChecksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userFind = users.find((user) => user.username === username);

  if (!userFind) {
    return response.status(404).json({ error: "Login de usuário inválido!" });
  }

  request.user = userFind;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameExists = users.some((user) => user.username === username);

  if (usernameExists) {
    return response.status(400).json({ error: "Já existe um usuário com este login!" });
  }

  const user = {
    id: v4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", ChecksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post("/todos", ChecksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: v4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", ChecksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todoFind = user.todos.find((todo) => todo.id === id);

  if (!todoFind) {
    return response.status(404).json({ error: "Todo não encontrado!" });
  }

  todoFind.title = title;
  todoFind.deadline = new Date(deadline);

  return response.status(200).json(todoFind);
});

app.patch("/todos/:id/done", ChecksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoFind = user.todos.find((todo) => todo.id === id);

  if (!todoFind) {
    return response.status(404).json({ error: "Todo não encontrado!" });
  }

  todoFind.done = !todoFind.done;

  return response.status(200).json(todoFind);
});

app.delete("/todos/:id", ChecksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoFindIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoFindIndex === -1) {
    return response.status(404).json({ error: "Todo não encontrado!" });
  }

  user.todos.splice(todoFindIndex, 1);

  return response.status(204).json({ message: "Todo excluído com sucesso!" });
});

module.exports = app;
