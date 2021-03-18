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
  bindClearCompletedClicked(callback) {
    this.onClearCompletedClicked = callback;
  }
  _commit(todos, modeBtn, clearCompleted) {
    this.onTodoListChanged(todos);
    this.onModeBtnClicked(modeBtn);
    this.onClearCompletedClicked(clearCompleted);
    localStorage.setItem("todos", JSON.stringify(todos));
    localStorage.setItem("count", JSON.stringify(this.count));
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
    this.showAll = this.getElement(".filter:nth-child(1)");
    this.filterActive = this.getElement(".filter:nth-child(2)");
    this.filterCompleted = this.getElement(".filter:nth-child(3)");

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
  _clearCompleted(todos) {
    this.clearCompleted.addEventListener("click", (e) => {
      e.preventDefault;
      this.todos.forEach((todo) => {
        if (todo.complete) {
          todo.remove();
        }
      });
    });
  }
  // showAll(todos) {
  //   todos.forEach((todo) => todo.classList.remove("hidden"));
  // }
  // filterCompleted(todos) {
  //   todos.forEach((todo) => {
  //     if (!todo.complete) {
  //       todo.classList.add("hidden");
  //     }
  //   });
  // }
  // filterActive(todos) {
  //   todos.forEach((todo) => {
  //     if (todo.complete) {
  //       todo.classList.add("hidden");
  //     }
  //   });
  // }
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
    this.model.bindClearCompletedClicked(this.onClearCompletedClicked);

    this.view.bindAddTodo(this.handleAddTodo);
    this.view.bindDeleteTodo(this.handleDeleteTodo);
    this.view.bindToggleTodo(this.handleToggleTodo);
    this.view.bindDragTodo(this.handleDragTodo);
    this.view.bindDragOverTodo(this.handleDragOverTodo);

    this.onTodoListChanged(this.model.todos);
    this.onModeBtnClicked(this.model.modeBtn);
    this.onClearCompletedClicked(this.model.clearCompleted);
  }

  onTodoListChanged = (todos) => {
    this.view.displayTodos(todos);
    this.view.updateCount(todos);
    // this.view._clearCompleted(todos);
    // this.view.showAll(todos);
    // this.view.filterCompleted(todos);
    // this.view.filterActive(todos);
  };
  onModeBtnClicked = () => {
    this.view.changeTheme();
  };
  onClearCompletedClicked = (todos) => {
    this.view._clearCompleted(todos);
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
