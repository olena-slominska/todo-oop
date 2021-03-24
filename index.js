/**
 * class Model
 *
 * Manages the data of the application.
 */
class Model {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem("todos")) || [];
    this.count = JSON.parse(localStorage.getItem("count")) || 0;
    this.elem = null;
  }

  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback;
  }
  bindModeBtnClicked(callback) {
    this.onModeBtnClicked = callback;
  }

  addTodo(todoText) {
    const todo = {
      id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
      text: todoText,
      complete: false,
      draggable: true,
    };

    this.todos.push(todo);

    this._commit(this.todos);
  }

  deleteTodo(id) {
    this.todos = this.todos.filter((todo) => todo.id !== id);

    this._commit(this.todos);
  }

  _commit(todos, modeBtn) {
    this.onTodoListChanged(todos);
    this.onModeBtnClicked(modeBtn);
    localStorage.setItem("todos", JSON.stringify(todos));
    localStorage.setItem("count", JSON.stringify(this.count));
  }
  _clearCompleted() {
    this.todos = this.todos.filter((todo) => todo.complete === false);
    this._commit(this.todos);
  }

  _filterCompleted() {
    const todosComplete = this.todos.filter((todo) => todo.complete === true);
    this._commit(todosComplete);
  }
  _filterActive() {
    const todosActive = this.todos.filter((todo) => todo.complete == false);
    this._commit(todosActive);
  }
  _showAll() {
    this._commit(this.todos);
  }

  toggleTodo(id) {
    this.todos = this.todos.map((todo) =>
      todo.id === id
        ? { id: todo.id, text: todo.text, complete: !todo.complete }
        : todo
    );

    this._commit(this.todos);
  }

  dragTodo(id, e) {
    this.todos = this.todos.map((todo) => {
      if (todo.id === id) {
        e.dataTransfer.effectAllowed = "move";
        elem = todo;
      } else {
        return todo;
      }
    });

    this._commit(this.todos);
  }
  dragOverTodo(id, e) {
    this.todos = this.todos.map((todo) => {
      let el1;
      if (todo.id === id) {
        el1 = todo;
      } else {
        el1 = todo.parentElement;
      }
      if (isBefore(elem, el1)) {
        el1.parentNode.insertBefore(elem, el1);
      } else {
        el1.parentNode.insertBefore(elem, el1.nextSibling);
      }
      this._dragEndTodo();
    });

    this._commit(this.todos);
  }
}

/**
 * class View
 *
 * Visual representation of the model.
 */
class View {
  constructor() {
    this.app = this.getElement(".wrapper3");
    this.modeBtn = this.getElement(".todo-header_btn");
    this.itemsCount = this.getElement(".items-count");
    this.clearCompleted = this.getElement(".clear-completed");
    this.showAll = this.getElement(".show-all");
    this.filterActive = this.getElement(".show-active");
    this.filterCompleted = this.getElement(".show-completed");

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

  _dragEndTodo() {
    this.todoList.addEventListener("dragend", () => {
      elem = null;
    });
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
    // Delete all todos before desplaying the correct list
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

  updateCount(todos) {
    this.count = todos.filter((todo) => todo.complete === false).length;
    this.itemsCount.textContent = `${this.count} items left`;
  }
  changeTheme() {
    this.modeBtn.addEventListener("click", (e) => {
      e.preventDefault;
      document.body.classList.toggle("light-theme");
    });
  }

  bindAddTodo(handler) {
    this.input.addEventListener("keyup", (e) => {
      if (this._todoText && e.key === "Enter") {
        handler(this._todoText);
        this._resetInput();
      }
    });
  }

  bindClearCompletedClicked(handler) {
    this.clearCompleted.addEventListener("click", () => {
      handler();
    });
  }
  bindFilterCompletedClicked(handler) {
    this.filterCompleted.addEventListener("click", () => {
      handler();
    });
  }
  bindFilterActiveClicked(handler) {
    this.filterActive.addEventListener("click", () => {
      handler();
    });
  }
  bindShowAllClicked(handler) {
    this.showAll.addEventListener("click", () => {
      handler();
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

  bindDragTodo(handler) {
    this.todoList.addEventListener("dragstart", (e) => {
      if (e.target.className.contains("todo")) {
        const id = parseInt(e.target.parentElement.id);
        handler(id, e);
      }
    });
  }
  bindDragOverTodo(handler) {
    this.todoList.addEventListener("dragover", (e) => {
      e.preventDefault;
      if (e.target.className.contains("todo")) {
        const id = parseInt(e.target.parentElement.id);
        handler(id, e);
      }
    });
  }
}

/**
 * class Controller
 *
 * Links the user input and the view output.

 */
class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Explicit this binding
    this.model.bindTodoListChanged(this.onTodoListChanged);
    this.model.bindModeBtnClicked(this.onModeBtnClicked);

    this.view.bindClearCompletedClicked(this.handleClearCompletedClicked);
    this.view.bindFilterCompletedClicked(this.handleFilterCompletedClicked);
    this.view.bindFilterActiveClicked(this.handleFilterActiveClicked);
    this.view.bindShowAllClicked(this.handleShowAllClicked);

    this.view.bindAddTodo(this.handleAddTodo);
    this.view.bindDeleteTodo(this.handleDeleteTodo);
    this.view.bindToggleTodo(this.handleToggleTodo);
    this.view.bindDragTodo(this.handleDragTodo);
    this.view.bindDragOverTodo(this.handleDragOverTodo);

    this.onTodoListChanged(this.model.todos);
    this.onModeBtnClicked(this.model.modeBtn);
  }

  onTodoListChanged = (todos) => {
    this.view.displayTodos(todos);
    this.view.updateCount(todos);
  };
  onModeBtnClicked = () => {
    this.view.changeTheme();
  };
  handleClearCompletedClicked = () => {
    this.model._clearCompleted();
  };
  handleFilterCompletedClicked = () => {
    this.model._filterCompleted();
  };
  handleFilterActiveClicked = () => {
    this.model._filterActive();
  };
  handleShowAllClicked = () => {
    this.model._showAll();
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
  handleDragTodo = (id, e) => {
    this.model.dragTodo(id, e);
  };
  handleDragOverTodo = (id, e) => {
    this.model.dragOverTodo(id, e);
  };
}

const app = new Controller(new Model(), new View());
