document.addEventListener("DOMContentLoaded", function () {
  const addTaskButton = document.getElementById("addTaskButton");
  const floatingWindow = document.getElementById("floatingWindow");
  const closeFloatingWindow = document.getElementById("closeFloatingWindow");
  const saveTaskButton = document.getElementById("saveTaskButton");
  const taskList = document.getElementById("taskList");
  const taskDetailsWindow = document.getElementById("taskDetailsWindow");
  const closeTaskDetails = document.getElementById("closeTaskDetails");


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

     // Create a new task object
     const task = {
      name: taskName,
      category: category,
      tag: tag,
      priority: priority,
      assignee: assignee,
      storyPoint: storyPoint,
      taskDescription: taskDescription,
      taskStatus: taskStatus,
    };

    // Create a new task container
    const taskContainer = document.createElement("div");
    taskContainer.classList.add("task-container");
    
    // Create a task box with dynamic content
    const taskBox = document.createElement("div");
    taskBox.classList.add("task-box");
    taskBox.innerHTML = `
      <p><strong>Name:</strong> ${taskName}</p>
      <p><strong>Tag:</strong> ${tag}</p>
      <p><strong>Story Point:</strong> ${storyPoint}</p>
      <p><strong>Priority:</strong> ${priority}</p>
    `;

    // Add a click event listener to each task container
    taskContainer.addEventListener("click", function () {
      // Display task details in the task details window when a task is clicked
      displayTaskDetails(task);
    });

    // Append the task box to the task container
    taskContainer.appendChild(taskBox);

    // Append the task container to the task list container
    taskList.appendChild(taskContainer);
    
    // Function to display task details in the task details window
    function displayTaskDetails(task) {
      const taskDetailsContent = document.getElementById("taskDetailsContent");
      taskDetailsContent.innerHTML = `
        <p><strong>Name:</strong> ${task.name}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Tag:</strong> ${task.tag}</p>
        <p><strong>Priority:</strong> ${task.priority}</p>
        <p><strong>Assignee:</strong> ${assignee}</p>
        <p><strong>Story Point:</strong> ${task.storyPoint}</p>
        <p><strong>Description:</strong> ${taskDescription}</p>
        <p><strong>Status:</strong> ${taskStatus}</p>
      `;

      // Show the task details window
      taskDetailsWindow.style.display = "block";
    }

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

  // Close the task details window when the "Close" button is clicked
  closeTaskDetails.addEventListener("click", function () {
    taskDetailsWindow.style.display = "none";
  });



});
