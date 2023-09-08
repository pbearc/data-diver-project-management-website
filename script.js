document.addEventListener("DOMContentLoaded", function () {
  const addTaskButton = document.getElementById("addTaskButton");
  const floatingWindow = document.getElementById("floatingWindow");
  const closeFloatingWindow = document.getElementById("closeFloatingWindow");

  addTaskButton.addEventListener("click", function () {
    floatingWindow.style.display = "block"; // Show the floating window
  });

  closeFloatingWindow.addEventListener("click", function () {
    floatingWindow.style.display = "none"; // Hide the floating window
  });
});
