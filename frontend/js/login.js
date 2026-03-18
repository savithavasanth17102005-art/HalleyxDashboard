let selectedRole = "user";

function selectRole(role){
  selectedRole = role;
  document.getElementById("roleTitle").innerText = role.charAt(0).toUpperCase() + role.slice(1) + " Login";

  document.getElementById("userBtn").classList.remove("active");
  document.getElementById("adminBtn").classList.remove("active");

  if(role==="user") document.getElementById("userBtn").classList.add("active");
  else document.getElementById("adminBtn").classList.add("active");
}

let users = JSON.parse(localStorage.getItem("users")||"[]");

function openRegister(){
  document.getElementById("registerPopup").style.display="flex";
}

function closeRegister(){
  document.getElementById("registerPopup").style.display="none";
}

window.register = async function(){

  let email = document.getElementById("regEmail").value.trim();
  let password = document.getElementById("regPassword").value.trim();
  let name = document.getElementById("regName").value.trim();

  if(!email || !password || !name){
    alert("All fields required");
    return;
  }

  try{

    let response = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
        role: selectedRole
      })
    });

    let data = await response.json();

    if(data.success){
      localStorage.setItem("userName", name);
      alert("Registered successfully!");
      closeRegister();
    }else{
      alert(data.message);
    }

  }catch(err){
    console.log(err);
    alert("Server error");
  }

}

window.login = async function(){

  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();

  if(!email || !password){
    alert("Enter email and password");
    return;
  }

  try{

    let response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password,
        role: selectedRole
      })
    });

    let data = await response.json();

    if(data.success){

      // save user
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      alert("Login successful");

      // 🔥 REDIRECT
      if(data.user.role === "admin"){
        window.location.href = "dashboard.html";
      }else{
        window.location.href = "user.html";
      }

    }else{
      alert(data.message);
    }

  }catch(err){
    console.log(err);
    alert("Server error");
  }

}
