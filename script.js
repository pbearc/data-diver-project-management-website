document.addEventListener("DOMContentLoaded", function () {
  const addTaskButton = document.getElementById("addTaskButton");
  const floatingWindow = document.getElementById("floatingWindow");
  const closeFloatingWindow = document.getElementById("closeFloatingWindow");
  const saveTaskButton = document.getElementById("saveTaskButton");
  const taskList = document.getElementById("taskList");

  addTaskButton.addEventListener("click", function () {
    floatingWindow.style.display = "block"; // Show the floating window
  });

  closeFloatingWindow.addEventListener("click", function () {
    floatingWindow.style.display = "none"; // Hide the floating window
  });

  saveTaskButton.addEventListener("click", function () {
    // Get user input
    const taskName = document.getElementById("taskName").value;
    const category = document.getElementById("category").value;
    const tag = document.getElementById("tag").value;
    const priority = document.getElementById("priority").value;
    const assignee = document.getElementById("assignee").value;
    const storyPoint = document.getElementById("storyPoint").value;
    const taskDescription = document.getElementById("taskDescription").value;
    const taskStatus = document.getElementById("taskStatus").value;

    // Create a new task container
    const taskContainer = document.createElement("div");
    taskContainer.classList.add("task-container");

    // Create a task box with dynamic content
    const taskBox = document.createElement("div");
    taskBox.classList.add("task-box");
    taskBox.innerHTML = `
      <h2>${taskName}</h2>
      <p><strong>Task Name:</strong> ${taskName}</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Tag:</strong> ${tag}</p>
      <p><strong>Priority:</strong> ${priority}</p>
      <p><strong>Assignee:</strong> ${assignee}</p>
      <p><strong>Story Point:</strong> ${storyPoint}</p>
      <p><strong>Description:</strong> ${taskDescription}</p>
      <p><strong>Status:</strong> ${taskStatus}</p>
    `;

    // Append the task box to the task container
    taskContainer.appendChild(taskBox);

    // Append the task container to the task list container
    taskList.appendChild(taskContainer);
    
    // Hide the floating window
    floatingWindow.style.display = "none";

    // Clear input fields for the next task
    document.getElementById("taskName").value = "";
    document.getElementById("category").value = "category1";
    document.getElementById("tag").value = "tag1";
    document.getElementById("priority").value = "low";
    document.getElementById("assignee").value = "user1";
    document.getElementById("storyPoint").value = "";
    document.getElementById("taskDescription").value = "";
    document.getElementById("taskStatus").value = "todo";
  });



});
