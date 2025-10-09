
// Get DOM elements
const input = document.getElementById("todo-input") as HTMLInputElement;
const addBtn = document.getElementById("add-btn") as HTMLButtonElement;
const todoList = document.getElementById("todo-list") as HTMLUListElement;

// add a new Todo

function addTodo() {
    const todoTest = input.value.trim();
    if(!todoTest) return;

    const li = document.createElement("li");
    li.textContent = todoTest;

    // Toggle "done" class on click
    li.addEventListener("click", () =>{
        li.classList.toggle("done");
    });

    // Remove todo on double click
    li.addEventListener("dblclick", () => {
        todoList.removeChild(li);
    });

    todoList.appendChild(li);
    input.value = "";

}

// Event listener

addBtn.addEventListener("click", addTodo);

// Add todo on enter key

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTodo();
});