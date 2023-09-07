// script.js

document.addEventListener("DOMContentLoaded", function () {
  const addTaskButton = document.getElementById("addTaskButton");
  const taskList = document.getElementById("taskList");

  addTaskButton.addEventListener("click", function () {
    // Create a new task element
    const newTask = document.createElement("div");
    newTask.className = "task";

    // Create a text input for the task description
    const taskInput = document.createElement("input");
    taskInput.type = "text";
    taskInput.placeholder = "Enter task description";

    // Create a button to add the task
    const addButton = document.createElement("button");
    addButton.textContent = "Add Task";

    // Handle the task addition
    addButton.addEventListener("click", function () {
      const taskDescription = taskInput.value;
      if (taskDescription.trim() !== "") {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";
        taskItem.textContent = taskDescription;
        taskList.appendChild(taskItem);
        taskInput.value = ""; // Clear the input field
      }
    });

    // Append the input and button to the new task element
    newTask.appendChild(taskInput);
    newTask.appendChild(addButton);

    // Append the new task element to the task list
    taskList.appendChild(newTask);
  });
});
