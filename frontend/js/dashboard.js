

let currentWidget = null;
let realData = [];
let filteredData = [];

function generateColors(count){

  const colors = [
    "#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF",
    "#FF9F40","#8BC34A","#E91E63","#00BCD4","#9C27B0"
  ];

  let result = [];

  for(let i=0;i<count;i++){
    result.push(colors[i % colors.length]);
  }

  return result;
}

function calculateKPI(metric, type){

  if(!realData.length) return 0;

  if(type === "count"){
    return realData.length;
  }

  if(type === "sum"){
    return realData.reduce((sum, d) => sum + Number(d[metric] || 0), 0);
  }

  if(type === "avg"){
    let total = realData.reduce((sum, d) => sum + Number(d[metric] || 0), 0);
    return (total / realData.length).toFixed(2);
  }

  return 0;
}


function buildChart(id, type, xKey, yKey, color){

  if(!xKey || !yKey || !realData.length){
    console.log("Missing data");
    return;
  }

  let grouped = {};

  (filteredData.length ? filteredData : realData).forEach(d => {

    let x = d[xKey];
    let y = d[yKey];

    let value = isNaN(y) ? 1 : Number(y);

    if(!grouped[x]){
      grouped[x] = 0;
    }

    grouped[x] += value;

  });

  let labels = Object.keys(grouped);
  let values = Object.values(grouped);

  new Chart(document.getElementById(id),{
  type: type,

  options: {
    responsive: true,
    maintainAspectRatio: false   
  },

  data:{
      labels: labels,
      datasets:[{
        label: yKey,
        data: values,
        backgroundColor: type === "pie"
  ? generateColors(values.length)
  : color || "#54bd95",
borderColor: type === "pie"
  ? "#fff"
  : (color || "#54bd95")
      }]
    }
  });

}
function showDashboard(){

document.getElementById("dashboardView").style.display="block";
document.getElementById("configView").style.display="none";

}

function showOrders(){
  window.location.href = "admin-orders.html";
}


function openConfig(){

  document.getElementById("dashboardView").style.display="none";
  document.getElementById("configView").style.display="block";

  let canvas = document.getElementById("canvas");

  
  canvas.innerHTML = "";

  checkPlaceholder();
}


function closeConfig(){

document.getElementById("dashboardView").style.display="block";
document.getElementById("configView").style.display="none";


document.getElementById("settingsPanel").classList.remove("active");


document.getElementById("canvas").classList.remove("settings-shift");

}


function toggleSidebar(){

let sidebar = document.getElementById("sidebar");
let canvas = document.getElementById("canvas");

if(sidebar.classList.contains("active")){

sidebar.classList.remove("active");
canvas.classList.remove("shift");

}else{

sidebar.classList.add("active");
canvas.classList.add("shift");

}

}


function saveDashboard(){

  let existing = localStorage.getItem("dashboardWidgets") || "";

  let canvas = document.getElementById("canvas");

  let newWidgets = "";

  canvas.querySelectorAll(".widget").forEach(widget => {
    newWidgets += widget.outerHTML;
  });

  let updated = existing + newWidgets;

  localStorage.setItem("dashboardWidgets", updated);

  closeConfig();
  loadDashboard();
}

function loadDashboard(){ 
      
if(!realData.length){
  console.log("Waiting for data...");
  return;
}
let saved = localStorage.getItem("dashboardWidgets");

let dashboard = document.getElementById("dashboardWidgets");

dashboard.innerHTML = saved || "";


let widgets = dashboard.querySelectorAll(".widget");

widgets.forEach(widget => {
      
let icons = widget.querySelector(".widget-icons");

if(!icons){
  icons = document.createElement("div");
  icons.className = "widget-icons";
  widget.appendChild(icons);
}


icons.innerHTML = `<span onclick="deleteWidget(this)">🗑</span>`;
      let width = widget.dataset.width;
let height = widget.dataset.height;

if(width) widget.style.width = width + "px";
if(height) widget.style.height = height + "px";


let descData = widget.dataset.desc;

if(descData){

let descEl = widget.querySelector(".widget-desc");

if(descEl){
descEl.innerText = descData;
}

}





let chartType = widget.dataset.chartType || "Bar Chart";
let color = widget.dataset.chartColor || "#54bd95";
let xKey = widget.dataset.xAxis || "product";
let yKey = widget.dataset.yAxis || "quantity";



let chartCanvas = widget.querySelector("canvas");

if(chartCanvas){

let grouped = {};

if(xKey && yKey){

  realData.forEach(d => {

    let x = d[xKey];
    let y = d[yKey];

    let value = isNaN(y) ? 1 : Number(y);

    if(!grouped[x]){
      grouped[x] = 0;
    }

    grouped[x] += value;

  });

}

let labels = Object.keys(grouped);
let values = Object.values(grouped);

let existingChart = Chart.getChart(chartCanvas);
if(existingChart){
  existingChart.destroy();
}


let type = "bar";

if(chartType.includes("Bar")) type = "bar";
else if(chartType.includes("Line")) type = "line";
else if(chartType.includes("Pie")) type = "pie";

new Chart(chartCanvas,{
  type: type,
  data:{
    labels: labels,
    datasets:[{
      label: yKey,   
      data: values,
      backgroundColor: type === "pie"
  ? generateColors(values.length)
  : color,
borderColor: type === "pie"
  ? "#fff"
  : color
     
    }]
  }
});
}

});


let deleteBtns = dashboard.querySelectorAll(".widget-icons span:last-child");

deleteBtns.forEach(btn=>{
  btn.onclick = function(){

    let widget = this.closest(".widget");

    if(widget){
      widget.remove();
    }

    checkDashboardEmpty();

    
    let dashboard = document.getElementById("dashboardWidgets");
    localStorage.setItem("dashboardWidgets", dashboard.innerHTML);

  };
});


dashboard.querySelectorAll(".widget").forEach(widget => {

  let icons = widget.querySelector(".widget-icons");

  if(!icons){
    let div = document.createElement("div");
    div.className = "widget-icons";
    div.innerHTML = `
      <span onclick="openWidgetSettings(this)">⚙</span>
      <span onclick="deleteWidget(this)">🗑</span>
    `;
    widget.appendChild(div);
  }

});
checkDashboardEmpty();
}
window.onload = function(){

  showDashboard();

  
  fetch("http://localhost:3000/current-user")
    .then(res => res.json())
    .then(user => {
      console.log("USER:", user);

      if(user && user.name){
        document.getElementById("welcomeName").innerText = "Welcome, " + user.name;
      }
    });

  loadRealData(); 

  checkPlaceholder();

}


const widgets=document.querySelectorAll(".widget-item");
const canvas=document.getElementById("canvas");

let draggedWidget=null;


widgets.forEach(widget=>{

widget.addEventListener("dragstart",()=>{

draggedWidget=widget.dataset.type;

});

});


canvas.addEventListener("dragover",(e)=>{

e.preventDefault();

});


canvas.addEventListener("drop",()=>{

let placeholder=document.getElementById("placeholder");


if(placeholder){
placeholder.remove();
}

let widget=document.createElement("div");

widget.className="widget";

widget.dataset.chartType = draggedWidget;

let chartId = "chart_" + Date.now() + "_" + Math.floor(Math.random()*1000);

let content="";


if(
  draggedWidget==="Bar Chart" ||
  draggedWidget==="Line Chart" ||
  draggedWidget==="Pie Chart"
){

  content = `
<div class="chart-container">
  <canvas id="${chartId}"></canvas>
</div>
`;

}


else if(draggedWidget==="Table"){

content = `
<table class="widget-table">
<thead>
<tr>
<th>Name</th>
<th>Email</th>
<th>Product</th>
<th>Qty</th>
<th>Total</th>
</tr>
</thead>

<tbody>
${realData.map(o => `
<tr>
<td>${o.firstName} ${o.lastName}</td>
<td>${o.email}</td>
<td>${o.product}</td>
<td>${o.quantity}</td>
<td>${o.total}</td>
</tr>
`).join("")}
</tbody>
</table>
`;

}

else if(draggedWidget.includes("KPI")){

let metric = "total";   
let type = "sum";       

let value = calculateKPI(metric, type);

content=`

<div class="kpi">

<div class="kpi-value">${value}</div>
<div class="kpi-label">${type.toUpperCase()} of ${metric}</div>

</div>

`;

}


widget.innerHTML = `

<div class="widget-icons">

<span onclick="openWidgetSettings(this)">⚙</span>

<span onclick="deleteWidget(this)">🗑</span>

</div>

<h3 class="widget-title">${draggedWidget}</h3>

<p class="widget-desc" style="font-size:13px;color:#666;margin-bottom:10px;"></p>

${content}

`;


canvas.appendChild(widget);
checkPlaceholder();

let xKey = "product";   
let yKey = "quantity";  

if(draggedWidget==="Bar Chart" && realData.length){
  buildChart(chartId, "bar", xKey, yKey);
}

if(draggedWidget==="Line Chart" && realData.length){
  buildChart(chartId, "line", xKey, yKey);
}

if(draggedWidget==="Pie Chart" && realData.length){
  buildChart(chartId, "pie", xKey, yKey);
}

});



function openWidgetSettings(el){

currentWidget = el.closest(".widget");

let title = currentWidget.querySelector(".widget-title").innerText;

document.getElementById("widgetTitle").value = title;
document.getElementById("widgetType").value = currentWidget.dataset.chartType || "Chart";
document.getElementById("widgetDesc").value = currentWidget.dataset.desc || "";

document.getElementById("widgetWidth").value = currentWidget.dataset.width || 400;
document.getElementById("widgetHeight").value = currentWidget.dataset.height || 550;

document.getElementById("chartColor").value =
currentWidget.dataset.chartColor || "#54bd95";

document.getElementById("settingsPanel").classList.add("active");

document.getElementById("canvas").classList.add("settings-shift");

}
function closeSettings(){

document.getElementById("settingsPanel").classList.remove("active");


document.getElementById("canvas").classList.remove("settings-open");

}

function saveWidgetSettings(){

console.log("SAVE BUTTON CLICKED");

if(!currentWidget) return;


let title = document.getElementById("widgetTitle").value;
let desc = document.getElementById("widgetDesc").value;
let color = document.getElementById("chartColor").value;
let xAxis = document.getElementById("xAxis").value;
let yAxis = document.getElementById("yAxis").value;


currentWidget.querySelector(".widget-title").innerText = title;


let descEl = currentWidget.querySelector(".widget-desc");

if(!descEl){

descEl = document.createElement("p");
descEl.className = "widget-desc";
descEl.style = "font-size:13px;color:#666;margin-bottom:10px;";

let titleEl = currentWidget.querySelector(".widget-title");
titleEl.insertAdjacentElement("afterend", descEl);

}

descEl.innerText = desc || "";


currentWidget.dataset.desc = desc;
currentWidget.dataset.chartColor = color;
currentWidget.dataset.xAxis = xAxis;
currentWidget.dataset.yAxis = yAxis;




let chartCanvas = currentWidget.querySelector("canvas");

if(chartCanvas){

  let chartType = currentWidget.dataset.chartType || "Bar Chart";

  let type = "bar";
  if(chartType.includes("Line")) type = "line";
  else if(chartType.includes("Pie")) type = "pie";

  buildChart(chartCanvas.id, type, xAxis, yAxis, color);
}
let chart = Chart.getChart(chartCanvas);

if(chart){


let chartType = currentWidget.dataset.chartType || "";

if(chartType.includes("Pie")){
  chart.data.datasets[0].backgroundColor = generateColors(chart.data.labels.length);
  chart.data.datasets[0].borderColor = "#fff";
}else{
  chart.data.datasets[0].backgroundColor = color;
  chart.data.datasets[0].borderColor = color;
}


if(xAxis && yAxis){

let grouped = {};

realData.forEach(d => {

  let x = d[xAxis];
  let y = d[yAxis];

  let value = isNaN(y) ? 1 : Number(y);

  if(!grouped[x]){
    grouped[x] = 0;
  }

  grouped[x] += value;

});

let labels = Object.keys(grouped);
let values = Object.values(grouped);

chart.data.labels = labels;
chart.data.datasets[0].data = values;

}
let width = document.getElementById("widgetWidth").value;
let height = document.getElementById("widgetHeight").value;

if(width < 300) width = 400;
if(height < 250) height =550;

currentWidget.style.height = height + "px";


currentWidget.style.width = width + "px";
currentWidget.style.height = height + "px";

currentWidget.dataset.width = width;
currentWidget.dataset.height = height;
if(chartCanvas){
  chartCanvas.style.width = "100%";
  chartCanvas.style.height = "100%";
}

chart.update();
chart.resize(); // 
}




let dashboard = document.getElementById("dashboardWidgets");


let existing = dashboard.innerHTML;


existing += currentWidget.outerHTML;

localStorage.setItem("dashboardWidgets", existing);



closeSettings();
  closeConfig();
  loadDashboard();  

}


function checkDashboardEmpty(){

let dashboard = document.getElementById("dashboardWidgets");
let empty = document.getElementById("emptyDashboard");

if(!dashboard) return;

if(dashboard.querySelectorAll(".widget").length === 0){

empty.style.display = "flex";

}else{

empty.style.display = "none";

}

}
function checkPlaceholder(){

let canvas = document.getElementById("canvas");
let widgets = canvas.querySelectorAll(".widget");


if(widgets.length === 0){

let placeholder = document.getElementById("placeholder");

if(!placeholder){

placeholder = document.createElement("div");
placeholder.id = "placeholder";
placeholder.className = "placeholder";
placeholder.innerText = "Drag widgets from the left panel to build your dashboard";

canvas.appendChild(placeholder);

}

}else{

let placeholder = document.getElementById("placeholder");
if(placeholder){
placeholder.remove();
}

}

}
function deleteWidget(el){

  let widget = el.closest(".widget");

  if(widget){
    widget.remove();
  }

  checkDashboardEmpty();

  
  let dashboard = document.getElementById("dashboardWidgets");
  localStorage.setItem("dashboardWidgets", dashboard.innerHTML);
}
document.getElementById("chartColor").addEventListener("input",function(){

if(!currentWidget) return;

let canvas=currentWidget.querySelector("canvas");

if(!canvas) return;

let chart=Chart.getChart(canvas);

if(chart){

let chartType = currentWidget.dataset.chartType || "";

if(chartType.includes("Pie")){
  chart.data.datasets[0].backgroundColor = generateColors(chart.data.labels.length);
  chart.data.datasets[0].borderColor = "#fff";
}else{
  chart.data.datasets[0].backgroundColor = this.value;
  chart.data.datasets[0].borderColor = this.value;
}

chart.update();
}
});

let colorInput = document.getElementById("chartColor");
let colorHex = document.getElementById("colorHex");


colorInput.addEventListener("input",function(){

colorHex.value = this.value;


if(currentWidget){

let canvas = currentWidget.querySelector("canvas");

if(canvas){

let chart = Chart.getChart(canvas);

if(chart){
chart.data.datasets[0].backgroundColor = this.value;
chart.data.datasets[0].borderColor = this.value;
chart.update();
}

}

}

});


colorHex.addEventListener("input",function(){

colorInput.value = this.value;

});

function updateChart(){

if(!currentWidget) return;

let xKey = document.getElementById("xAxis").value;
let yKey = document.getElementById("yAxis").value;

if(!xKey || !yKey) return;

let canvas = currentWidget.querySelector("canvas");
if(!canvas) return;

let chart = Chart.getChart(canvas);
if(!chart) return;

let grouped = {};

realData.forEach(d => {

  let x = d[xKey];
  let y = d[yKey];

  let value = isNaN(y) ? 1 : Number(y);

  if(!grouped[x]){
    grouped[x] = 0;
  }

  grouped[x] += value;

});

let labels = Object.keys(grouped);
let values = Object.values(grouped);

chart.data.labels = labels;
chart.data.datasets[0].data = values;


let chartType = currentWidget.dataset.chartType || "";

if(chartType.includes("Pie")){
  chart.data.datasets[0].backgroundColor = generateColors(values.length);
  chart.data.datasets[0].borderColor = "#fff";
}

chart.update();
}

document.getElementById("xAxis").addEventListener("change",updateChart);
document.getElementById("yAxis").addEventListener("change",updateChart);

function goBack(){
  localStorage.removeItem("currentUser"); 
  window.location.href = "login.html";
}


function loadRealData(){

fetch("http://localhost:3000/orders")   

.then(res => res.json())
.then(data => {

  console.log("REAL DATA:", data);

  realData = data;
filteredData = data; 

  loadDashboard();   // refresh UI

})
.catch(err=>{
  console.error("Fetch error:", err);
});

}
function filterData(type){

  let now = new Date();

  if(type === "today"){

    filteredData = realData.filter(d => {
      let date = new Date(d.createdAt); 
      return date.toDateString() === now.toDateString();
    });

  }

  else if(type === "7days"){

    let past = new Date();
    past.setDate(now.getDate() - 7);

    filteredData = realData.filter(d => {
      let date = new Date(d.createdAt);
      return date >= past && date <= now;
    });

  }

  else if(type === "30days"){

    let past = new Date();
    past.setDate(now.getDate() - 30);

    filteredData = realData.filter(d => {
      let date = new Date(d.createdAt);
      return date >= past && date <= now;
    });

  }

  else if(type === "90days"){

    let past = new Date();
    past.setDate(now.getDate() - 90);

    filteredData = realData.filter(d => {
      let date = new Date(d.createdAt);
      return date >= past && date <= now;
    });

  }

  else{
    filteredData = realData;
  }

  console.log("Filtered:", filteredData.length);

  loadDashboard(); 
}


window.saveWidgetSettings = saveWidgetSettings;

window.saveDashboard = saveDashboard;