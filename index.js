const modeBtn = document.querySelector(".todo-header_btn");
const itemsCount = document.querySelector(".items-count");

modeBtn.addEventListener("click", (e) => {
  e.preventDefault;
  document.body.classList.toggle("light-theme");
});

/**
 * @class Model
 *
 * Manages the data of the application.
 */
class Model {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem("todos")) || [];
    this.count = localStorage.getItem("count") || 0;
  }

  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback;
  }

  _commit(todos) {
    this.onTodoListChanged(todos);
    localStorage.setItem("todos", JSON.stringify(todos));
    localStorage.setItem("count", this.count);
  }

  addTodo(todoText) {
    const todo = {
      id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
      text: todoText,
      complete: false,
    };

    this.todos.push(todo);

    this._commit(this.todos);
  }

  deleteTodo(id) {
    this.todos = this.todos.filter((todo) => todo.id !== id);

    this._commit(this.todos);
  }

  toggleTodo(id) {
    this.todos = this.todos.map((todo) =>
      todo.id === id
        ? { id: todo.id, text: todo.text, complete: !todo.complete }
        : todo
    );
    this.count = this.todos.filter((todo) => todo.complete === false).length;
    itemsCount.textContent = `${this.count} items left`;

    this._commit(this.todos);
  }
}

/**
 * @class View
 *
 * Visual representation of the model.
 */
class View {
  constructor() {
    this.app = this.getElement(".wrapper3");
    this.inputDiv = this.createElement("div", "todo-new");
    this.input = this.createElement("input", "todo-new_input");
    this.input.type = "text";
    this.input.name = "todo";
    this.inputCircle = this.createElement("div", "circle");
    this.inputDiv.append(this.inputCircle, this.input);
    this.todoList = this.createElement("div", "todo-list");
    this.app.append(this.inputDiv, this.todoList);
  }

  get _todoText() {
    return this.input.value;
  }

  _resetInput() {
    this.input.value = "";
  }

  createElement(tag, className) {
    const element = document.createElement(tag);
    if (className) element.classList.add(className);
    return element;
  }

  getElement(selector) {
    const element = document.querySelector(selector);
    return element;
  }

  displayTodos(todos) {
    // Delete all nodes before desplaying the correct list
    while (this.todoList.firstChild) {
      this.todoList.removeChild(this.todoList.firstChild);
    }

    todos.forEach((todo) => {
      const todoItem = this.createElement("div", "todo");
      todoItem.id = todo.id;

      const todoText = this.createElement("p", "todo-text");
      todoText.textContent = todo.text;

      const checkbox = this.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "checkbox";
      checkbox.id = "ch" + todo.id;
      checkbox.checked = todo.complete;

      const label = this.createElement("label", "circle");
      label.htmlFor = checkbox.id;

      if (!todo.complete) {
        todoText.classList.remove("lineThrough");
        label.classList.remove("active");
      } else {
        todoText.classList.add("lineThrough");
        label.classList.add("active");
      }

      const deleteButton = this.createElement("button", "delete");
      todoItem.append(checkbox, label, todoText, deleteButton);

      this.todoList.append(todoItem);
    });
  }

  bindAddTodo(handler) {
    this.input.addEventListener("keyup", (e) => {
      if (this._todoText && (e.key === "Enter" || e.keyCode === 13)) {
        handler(this._todoText);
        this._resetInput();
      }
    });
  }

  bindDeleteTodo(handler) {
    this.todoList.addEventListener("click", (e) => {
      if (e.target.className === "delete") {
        const id = parseInt(e.target.parentElement.id);
        handler(id);
      }
    });
  }

  bindToggleTodo(handler) {
    this.todoList.addEventListener("change", (e) => {
      if (e.target.type === "checkbox") {
        const id = parseInt(e.target.parentElement.id);
        handler(id);
      }
    });
  }
}

/**
 * @class Controller
 *
 * Links the user input and the view output.
 *
 * @param model
 * @param view
 */
class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Explicit this binding
    this.model.bindTodoListChanged(this.onTodoListChanged);
    this.view.bindAddTodo(this.handleAddTodo);
    this.view.bindDeleteTodo(this.handleDeleteTodo);
    this.view.bindToggleTodo(this.handleToggleTodo);

    // Display initial todos
    this.onTodoListChanged(this.model.todos);
  }

  onTodoListChanged = (todos) => {
    this.view.displayTodos(todos);
  };

  handleAddTodo = (todoText) => {
    this.model.addTodo(todoText);
  };

  handleDeleteTodo = (id) => {
    this.model.deleteTodo(id);
  };

  handleToggleTodo = (id) => {
    this.model.toggleTodo(id);
  };
}

const app = new Controller(new Model(), new View());
