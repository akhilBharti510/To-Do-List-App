const inputBox = document.getElementById("input-box");
const addBtn = document.getElementById("add-btn");
const listContainer = document.getElementById("list-container");
const filterBtns = document.querySelectorAll(".filter-btn");
const clearBtn = document.getElementById("clear-btn");
const dueDateInput = document.getElementById("due-date");
const priorityInput = document.getElementById("priority");

let dragSrcEl = null;

// Create task
function createTask(task){
  const li = document.createElement("li");
  li.draggable = true;
  li.dataset.priority = task.priority;
  li.dataset.due = task.due || "";
  li.classList.add(`priority-${task.priority}`);
  if(task.completed) li.classList.add("completed");

  // Check overdue
  if(task.due && new Date(task.due) < new Date() && !task.completed){
    li.classList.add("overdue");
  }

  const taskText = document.createElement("span");
  taskText.textContent = task.text;

  const dueSpan = document.createElement("span");
  dueSpan.textContent = task.due ? `Due: ${task.due}` : "";
  dueSpan.classList.add("due");

  const deleteSpan = document.createElement("span");
  deleteSpan.textContent = "\u00d7";
  deleteSpan.classList.add("delete");

  li.append(taskText, dueSpan, deleteSpan);
  listContainer.appendChild(li);
  addDragEvents(li);
}

// Add task
function addTask(){
  const text = inputBox.value.trim();
  if(!text){ alert("You must write something!"); return; }
  const due = dueDateInput.value;
  const priority = priorityInput.value;
  createTask({ text, due, priority, completed:false });
  inputBox.value=""; dueDateInput.value=""; priorityInput.value="Low";
  saveData(); applyFilter();
}

// Delete or toggle complete
listContainer.addEventListener("click", e=>{
  if(e.target.classList.contains("delete")){
    e.target.parentElement.remove();
  } else if(e.target.tagName==="SPAN" && !e.target.classList.contains("delete")){
    const li = e.target.parentElement;
    li.classList.toggle("completed");
    li.classList.remove("overdue");
  }
  saveData(); applyFilter();
});

inputBox.addEventListener("keypress", e=>{ if(e.key==="Enter") addTask(); });
addBtn.addEventListener("click", addTask);

// Clear all
clearBtn.addEventListener("click", ()=>{ listContainer.innerHTML=""; saveData(); });

// Save to localStorage
function saveData(){
  const tasks=[];
  listContainer.querySelectorAll("li").forEach(li=>{
    tasks.push({
      text: li.childNodes[0].textContent,
      due: li.dataset.due,
      priority: li.dataset.priority,
      completed: li.classList.contains("completed")
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Load tasks
function loadTasks(){
  const tasks=JSON.parse(localStorage.getItem("tasks"))||[];
  tasks.forEach(t=>createTask(t));
}
loadTasks();

// Filters
filterBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    filterBtns.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active"); applyFilter();
  });
});
function applyFilter(){
  const filter = document.querySelector(".filter-btn.active").dataset.filter;
  listContainer.querySelectorAll("li").forEach(li=>{
    li.style.display="flex";
    if(filter==="active" && li.classList.contains("completed")) li.style.display="none";
    if(filter==="completed" && !li.classList.contains("completed")) li.style.display="none";
  });
}

// Drag & Drop
function addDragEvents(item){
  item.addEventListener('dragstart', e=>{ dragSrcEl=item; e.dataTransfer.effectAllowed='move'; });
  item.addEventListener('dragover', e=>{ e.preventDefault(); });
  item.addEventListener('drop', e=>{
    e.preventDefault();
    if(dragSrcEl!==item){
      const nodes=Array.from(listContainer.children);
      const dragIndex=nodes.indexOf(dragSrcEl);
      const dropIndex=nodes.indexOf(item);
      if(dragIndex<dropIndex) listContainer.insertBefore(dragSrcEl,item.nextSibling);
      else listContainer.insertBefore(dragSrcEl,item);
      saveData();
    }
  });
}
