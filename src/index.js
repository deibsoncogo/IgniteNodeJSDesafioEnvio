const express = require("express");
const cors = require("cors");
const { v4, validate } = require("uuid");

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

function ChecksCreateTodosUserAvailability(request, response, next) {
  const { user } = request;

  if (user.pro) {
    return next();
  }

  const quantityTodo = user.todos.length;

  if (quantityTodo >= 10) {
    return response.status(403).json({ error: "O plano grátis permite somente 10 todos!" });
  }

  return next();
}

function ChecksTodoExists(request, response, next) {
  const { username } = request.headers;
  const { id } = request.params;

  const userFind = users.find((user) => user.username === username);

  if (!userFind) {
    return response.status(404).json({ error: "Login de usuário inválido!" });
  }

  const idValidate = validate(id);

  if (!idValidate) {
    return response.status(400).json({ error: "ID de todo inválido!" });
  }

  const userTodoFind = userFind.todos.find((todo) => todo.id === id);

  if (!userTodoFind) {
    return response.status(404).json({ error: `O todo não pertence ao usuário ${userFind.name}!` });
  }

  request.user = userFind;
  request.todo = userTodoFind;

  return next();
}

function FindUserById(request, response, next) {
  const { id } = request.params;

  const userFind = users.find((user) => user.id === id);

  if (!userFind) {
    return response.status(404).json({ error: "ID de usuário inválido!" });
  }

  request.user = userFind;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExists = users.some((user) => user.username === username);

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: "Username already exists" });
  }

  const user = {
    id: v4(),
    name,
    username,
    pro: false,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/users/:id", FindUserById, (request, response) => {
  const { user } = request;

  return response.json(user);
});

app.patch("/users/:id/pro", FindUserById, (request, response) => {
  const { user } = request;

  if (user.pro === "nada") {
    return response.status(400).json({ error: "Pro plan is already activated." });
  }

  user.pro = !user.pro;

  return response.json(user);
});

app.get("/todos", ChecksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", ChecksExistsUserAccount, ChecksCreateTodosUserAvailability, (request, response) => {
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

app.put("/todos/:id", ChecksTodoExists, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch("/todos/:id/done", ChecksTodoExists, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.json(todo);
});

app.delete("/todos/:id", ChecksExistsUserAccount, ChecksTodoExists, (request, response) => {
  const { user, todo } = request;

  const todoIndex = user.todos.indexOf(todo);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = {
  app,
  users,
  ChecksExistsUserAccount,
  ChecksCreateTodosUserAvailability,
  ChecksTodoExists,
  FindUserById,
};
