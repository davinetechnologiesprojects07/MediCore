const state = {
  role: localStorage.getItem("medicore_role") || null,
  page: "dashboard",
  patients: [
    {id:"P1024",name:"Aarav Kulkarni",dob:"1997-04-12",gender:"Male",phone:"+91 98765 21001",email:"aarav@example.test",blood:"O+",status:"Active"},
    {id:"P1025",name:"Meera Joshi",dob:"1989-11-03",gender:"Female",phone:"+91 98765 21002",email:"meera@example.test",blood:"A+",status:"Active"},
    {id:"P1026",name:"Rohan Patil",dob:"2001-02-18",gender:"Male",phone:"+91 98765 21003",email:"rohan@example.test",blood:"B+",status:"Active"},
    {id:"P1027",name:"Ananya Shah",dob:"1995-08-24",gender:"Female",phone:"+91 98765 21004",email:"ananya@example.test",blood:"AB+",status:"Active"},
    {id:"P1028",name:"Vikram Deshmukh",dob:"1978-06-09",gender:"Male",phone:"+91 98765 21005",email:"vikram@example.test",blood:"O-",status:"Active"},
    {id:"P1029",name:"Isha More",dob:"1992-12-30",gender:"Female",phone:"+91 98765 21006",email:"isha@example.test",blood:"A-",status:"Active"}
  ],
  doctors: [
    {id:"D201",name:"Dr. Riya Sharma",spec:"General Medicine",dept:"General Medicine",exp:"12 years",fee:"₹700",status:"Available"},
    {id:"D202",name:"Dr. Arjun Mehta",spec:"Cardiology",dept:"Cardiology",exp:"15 years",fee:"₹1,200",status:"Available"},
    {id:"D203",name:"Dr. Neha Patil",spec:"Dermatology",dept:"Dermatology",exp:"9 years",fee:"₹900",status:"In Consultation"},
    {id:"D204",name:"Dr. Kabir Joshi",spec:"Orthopedics",dept:"Orthopedics",exp:"11 years",fee:"₹1,000",status:"Available"},
    {id:"D205",name:"Dr. Sana Khan",spec:"Pediatrics",dept:"Pediatrics",exp:"8 years",fee:"₹800",status:"Available"},
    {id:"D206",name:"Dr. Amit Rao",spec:"Neurology",dept:"Neurology",exp:"14 years",fee:"₹1,300",status:"On Leave"}
  ],
  appointments: [
    {id:"APT-3041",patient:"Aarav Kulkarni",doctor:"Dr. Riya Sharma",dept:"General Medicine",time:"09:00 AM",date:"Today",status:"Completed"},
    {id:"APT-3042",patient:"Meera Joshi",doctor:"Dr. Arjun Mehta",dept:"Cardiology",time:"10:00 AM",date:"Today",status:"In Consultation"},
    {id:"APT-3043",patient:"Rohan Patil",doctor:"Dr. Neha Patil",dept:"Dermatology",time:"11:30 AM",date:"Today",status:"Checked-In"},
    {id:"APT-3044",patient:"Ananya Shah",doctor:"Dr. Kabir Joshi",dept:"Orthopedics",time:"01:00 PM",date:"Today",status:"Scheduled"},
    {id:"APT-3045",patient:"Vikram Deshmukh",doctor:"Dr. Sana Khan",dept:"Pediatrics",time:"02:30 PM",date:"Today",status:"Confirmed"},
    {id:"APT-3046",patient:"Isha More",doctor:"Dr. Riya Sharma",dept:"General Medicine",time:"04:00 PM",date:"Today",status:"No-Show"}
  ],
  notifications:[
    {title:"Appointment Confirmed",text:"APT-3045 with Dr. Sana Khan is confirmed.",time:"8 min ago"},
    {title:"Doctor Schedule Changed",text:"Dr. Arjun Mehta is available from 10:00 AM.",time:"26 min ago"},
    {title:"Follow-up Due",text:"A sample follow-up record needs review.",time:"1 hr ago"}
  ]
};

const roleMeta = {
  admin:{name:"Admin User",label:"Administrator",initials:"AU"},
  doctor:{name:"Dr. Riya Sharma",label:"Doctor",initials:"RS"},
  staff:{name:"Nisha Staff",label:"Reception / Staff",initials:"NS"},
  patient:{name:"Aarav Kulkarni",label:"Patient",initials:"AK"}
};

const navByRole = {
  admin:[
    ["dashboard","▦","Overview"],["patients","♙","Patients"],["doctors","✚","Doctors"],["departments","▤","Departments"],
    ["appointments","◷","Appointments"],["analytics","◒","Analytics"],["activity","≡","Activity Logs"],["system","⌁","System Status"]
  ],
  doctor:[
    ["dashboard","▦","Overview"],["appointments","◷","My Appointments"],["patients","♙","Patients"],["schedule","◫","My Schedule"],
    ["prescriptions","▤","Prescriptions"],["reports","▧","Medical Reports"]
  ],
  staff:[
    ["dashboard","▦","Overview"],["patients","♙","Patients"],["appointments","◷","Appointments"],["checkin","✓","Check-in Queue"],
    ["doctors","✚","Doctors"],["schedule","◫","Schedules"]
  ],
  patient:[
    ["dashboard","▦","Overview"],["doctors","✚","Find a Doctor"],["appointments","◷","My Appointments"],
    ["prescriptions","▤","Prescriptions"],["reports","▧","Medical Reports"],["notifications","♢","Notifications"]
  ]
};

const content = document.getElementById("content");
const toast = document.getElementById("toast");
const modalBackdrop = document.getElementById("modalBackdrop");

function esc(s){return String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function initials(name){return name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase();}
function badge(status){
  const map={Completed:"green","Confirmed":"green","Available":"green","Scheduled":"blue","Checked-In":"amber","In Consultation":"blue","Cancelled":"red","No-Show":"red","On Leave":"gray","Active":"green"};
  return `<span class="badge ${map[status]||"gray"}">${esc(status)}</span>`;
}
function notify(msg){
  toast.textContent=msg;toast.classList.add("show");clearTimeout(notify.t);
  notify.t=setTimeout(()=>toast.classList.remove("show"),2600);
}
function openModal(title,body,footer=`<button class="btn btn-secondary" data-close>Cancel</button>`){
  document.getElementById("modal").innerHTML=`<div class="modal-head"><h3>${title}</h3><button class="icon-btn" data-close>×</button></div><div class="modal-body">${body}</div><div class="modal-foot">${footer}</div>`;
  modalBackdrop.classList.remove("hidden");
}
function closeModal(){modalBackdrop.classList.add("hidden");}
modalBackdrop.addEventListener("click",e=>{if(e.target===modalBackdrop||e.target.closest("[data-close]"))closeModal();});

function setupUser(){
  const r=state.role, m=roleMeta[r];
  document.getElementById("sideAvatar").textContent=m.initials;document.getElementById("topAvatar").textContent=m.initials;
  document.getElementById("sideName").textContent=m.name;document.getElementById("topName").textContent=m.name;
  document.getElementById("sideRole").textContent=m.label;document.getElementById("topRole").textContent=m.label;
  document.getElementById("pageTitle").textContent=`Good morning, ${m.name.split(" ")[0]}`;
}
function setupNav(){
  document.getElementById("navMenu").innerHTML=navByRole[state.role].map(([key,icon,label])=>`<button class="nav-item ${state.page===key?"active":""}" data-page="${key}"><span class="nav-icon">${icon}</span>${label}</button>`).join("");
  document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>{state.page=b.dataset.page;document.getElementById("sidebar").classList.remove("open");render();});
}
function render(){
  setupUser();setupNav();
  const labels={dashboard:"Overview",patients:"Patients",doctors:"Doctors",departments:"Departments",appointments:"Appointments",analytics:"Analytics",activity:"Activity Logs",system:"System Status",schedule:"Schedule",prescriptions:"Prescriptions",reports:"Medical Reports",checkin:"Check-in Queue",notifications:"Notifications"};
  document.getElementById("breadcrumb").textContent=labels[state.page]||"Overview";
  if(state.page==="dashboard") renderDashboard();
  else if(state.page==="patients") renderPatients();
  else if(state.page==="doctors") renderDoctors();
  else if(state.page==="departments") renderDepartments();
  else if(state.page==="appointments") renderAppointments();
  else if(state.page==="analytics") renderAnalytics();
  else if(state.page==="activity") renderActivity();
  else if(state.page==="system") renderSystem();
  else if(state.page==="schedule") renderSchedule();
  else if(state.page==="checkin") renderCheckin();
  else if(state.page==="prescriptions") renderPrescriptions();
  else if(state.page==="reports") renderReports();
  else if(state.page==="notifications") renderNotifications();
}

function pageHead(kicker,title,desc,action=""){
 return `<div class="page-head"><div><span class="eyebrow">${kicker}</span><h2>${title}</h2><p>${desc}</p></div><div class="actions">${action}</div></div>`;
}
function kpi(label,value,meta,icon){return `<div class="kpi"><div class="kpi-top"><span class="kpi-label">${label}</span><span class="kpi-icon">${icon}</span></div><div class="kpi-value">${value}</div><div class="kpi-meta">${meta}</div></div>`}
function renderDashboard(){
 const isPatient=state.role==="patient", isDoctor=state.role==="doctor";
 const action=state.role==="patient"?`<button class="btn btn-primary" onclick="bookAppointment()">+ Book Appointment</button>`:
 state.role==="staff"?`<button class="btn btn-primary" onclick="createPatient()">+ Register Patient</button>`:
 state.role==="admin"?`<button class="btn btn-primary" onclick="createPatient()">+ Add Patient</button>`:"";
 content.innerHTML=pageHead("OPERATIONS OVERVIEW",isPatient?"Your healthcare workspace":isDoctor?"Your clinical workspace":"Healthcare operations dashboard","A focused view of today’s activity, workflow and platform health.",action)+`
 <div class="kpi-grid">
 ${kpi(isPatient?"Upcoming Appointments":"Total Patients",isPatient?"3":"1,284",isPatient?"Next: 10:00 AM":"+8.4% this month","♙")}
 ${kpi(isDoctor?"Today’s Appointments":"Active Doctors",isDoctor?"8":"48",isDoctor?"2 completed":"4 on duty","✚")}
 ${kpi(isPatient?"Prescriptions":"Today’s Appointments",isPatient?"6":"42","26 completed today","◷")}
 ${kpi(isPatient?"Medical Reports":"Completed Visits",isPatient?"12":"26","92% completion rate","▧")}
 </div>
 <div class="dashboard-grid">
   <div class="card"><div class="card-head"><h3>Today’s Appointments</h3><span>Live operational queue</span></div><div class="table-wrap">${appointmentTable(state.appointments)}</div></div>
   <div class="card"><div class="card-head"><h3>Appointment Overview</h3><span>Today</span></div><div class="card-body"><div class="donut-row"><div class="donut"></div><div class="legend">
    <div class="legend-row"><i class="legend-dot" style="background:#1f6feb"></i> Scheduled <strong>10</strong></div>
    <div class="legend-row"><i class="legend-dot" style="background:#0f9d8a"></i> Completed <strong>26</strong></div>
    <div class="legend-row"><i class="legend-dot" style="background:#e8a52b"></i> In Consultation <strong>3</strong></div>
    <div class="legend-row"><i class="legend-dot" style="background:#e25b5b"></i> Cancelled / No-show <strong>3</strong></div>
   </div></div></div></div>
   <div class="card"><div class="card-head"><h3>Department Statistics</h3><span>Appointments</span></div><div class="card-body"><div class="bar-chart">
    ${[70,52,82,45,62,36,50].map((v,i)=>`<div class="bar-col"><div class="bar" style="height:${v}%"></div><small>${["Gen","Card","Derma","Pedia","Ortho","Neuro","ENT"][i]}</small></div>`).join("")}
   </div></div></div>
   <div class="card"><div class="card-head"><h3>Recent Activity</h3><span>Latest events</span></div><div class="card-body"><div class="activity">
    ${[
      ["✓","Appointment completed","APT-3041 · Dr. Riya Sharma","4 min ago"],
      ["+","Patient checked in","P1026 · Rohan Patil","18 min ago"],
      ["▧","Prescription added","P1025 · Consultation C-881","34 min ago"],
      ["◷","Appointment confirmed","APT-3045 · Pediatrics","48 min ago"]
    ].map(x=>`<div class="activity-item"><span class="activity-icon">${x[0]}</span><div><strong>${x[1]}</strong><small>${x[2]}</small></div><span class="activity-time">${x[3]}</span></div>`).join("")}
   </div></div></div>
 </div>`;
}
function appointmentTable(items){
 return `<table class="data-table"><thead><tr><th>Patient</th><th>Doctor</th><th>Time</th><th>Department</th><th>Status</th></tr></thead><tbody>${items.map(a=>`<tr><td><div class="person"><span class="avatar">${initials(a.patient)}</span><div><strong>${esc(a.patient)}</strong><small>${a.id}</small></div></div></td><td>${esc(a.doctor)}</td><td>${a.time}</td><td>${esc(a.dept)}</td><td>${badge(a.status)}</td></tr>`).join("")}</tbody></table>`;
}
function renderPatients(){
 content.innerHTML=pageHead("PATIENT MANAGEMENT","Patients","Search, register and review fictional patient records.",`<button class="btn btn-primary" onclick="createPatient()">+ Register Patient</button>`)+`
 <div class="card"><div class="card-body"><div class="filter-row"><input id="patientSearch" placeholder="Search by patient name or ID..."><select id="patientStatus"><option>All statuses</option><option>Active</option></select></div></div></div>
 <div class="card table-card"><div class="table-wrap"><table class="data-table" id="patientTable"><thead><tr><th>Patient</th><th>DOB</th><th>Gender</th><th>Phone</th><th>Blood Group</th><th>Status</th><th></th></tr></thead><tbody></tbody></table></div></div>`;
 const fill=()=>{const q=(document.getElementById("patientSearch").value||"").toLowerCase();document.querySelector("#patientTable tbody").innerHTML=state.patients.filter(p=>`${p.name} ${p.id}`.toLowerCase().includes(q)).map(p=>`<tr><td><div class="person"><span class="avatar">${initials(p.name)}</span><div><strong>${esc(p.name)}</strong><small>${p.id}</small></div></div></td><td>${p.dob}</td><td>${p.gender}</td><td>${p.phone}</td><td>${p.blood}</td><td>${badge(p.status)}</td><td><button class="btn btn-secondary" onclick="viewPatient('${p.id}')">View</button></td></tr>`).join("")};fill();document.getElementById("patientSearch").oninput=fill;
}
function createPatient(){
 openModal("Register New Patient",`<form id="patientForm"><div class="form-grid">
 <label>Full Name<input name="name" required></label><label>Date of Birth<input name="dob" type="date" required></label>
 <label>Gender<select name="gender"><option>Male</option><option>Female</option><option>Other</option></select></label><label>Phone<input name="phone" required></label>
 <label>Email<input name="email" type="email"></label><label>Blood Group<select name="blood"><option>O+</option><option>A+</option><option>B+</option><option>AB+</option><option>O-</option><option>A-</option></select></label>
 <label class="full">Address<textarea name="address" rows="3"></textarea></label></div></form>`,`<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" onclick="savePatient()">Save Patient</button>`);
}
function savePatient(){
 const f=document.getElementById("patientForm"), fd=new FormData(f);if(!f.reportValidity())return;
 const p={id:"P"+(1030+state.patients.length),name:fd.get("name"),dob:fd.get("dob"),gender:fd.get("gender"),phone:fd.get("phone"),email:fd.get("email"),blood:fd.get("blood"),status:"Active"};
 state.patients.unshift(p);closeModal();notify("Patient registered successfully.");render();
}
function viewPatient(id){
 const p=state.patients.find(x=>x.id===id);
 openModal("Patient Profile",`<div class="profile-card"><div class="profile-banner"></div><div class="profile-main"><span class="avatar">${initials(p.name)}</span><div><h3>${esc(p.name)}</h3><p>${p.id} · ${p.gender}</p>${badge(p.status)}</div></div><div class="info-grid">
 <div class="info-box"><small>Date of Birth</small><strong>${p.dob}</strong></div><div class="info-box"><small>Blood Group</small><strong>${p.blood}</strong></div>
 <div class="info-box"><small>Phone</small><strong>${p.phone}</strong></div><div class="info-box"><small>Email</small><strong>${p.email}</strong></div>
 </div></div>`);
}
function renderDoctors(){
 content.innerHTML=pageHead("DOCTOR MANAGEMENT","Doctors","Browse fictional doctors, specializations and current availability.",`<button class="btn btn-primary" onclick="createDoctor()">+ Add Doctor</button>`)+`
 <div class="card table-card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Doctor</th><th>Specialization</th><th>Department</th><th>Experience</th><th>Fee</th><th>Status</th><th></th></tr></thead><tbody>
 ${state.doctors.map(d=>`<tr><td><div class="person"><span class="avatar">${initials(d.name)}</span><div><strong>${esc(d.name)}</strong><small>${d.id}</small></div></div></td><td>${d.spec}</td><td>${d.dept}</td><td>${d.exp}</td><td>${d.fee}</td><td>${badge(d.status)}</td><td><button class="btn btn-secondary" onclick="doctorDetails('${d.id}')">View</button></td></tr>`).join("")}</tbody></table></div></div>`;
}
function createDoctor(){
 openModal("Add Doctor",`<form id="doctorForm"><div class="form-grid"><label>Doctor Name<input name="name" required></label><label>Specialization<input name="spec" required></label><label>Department<input name="dept" required></label><label>Experience<input name="exp" placeholder="e.g. 8 years"></label><label>Consultation Fee<input name="fee" placeholder="₹800"></label><label>Status<select name="status"><option>Available</option><option>On Leave</option></select></label></div></form>`,`<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" onclick="saveDoctor()">Save Doctor</button>`);
}
function saveDoctor(){const f=document.getElementById("doctorForm"),fd=new FormData(f);if(!f.reportValidity())return;state.doctors.push({id:"D"+(207+state.doctors.length),name:fd.get("name"),spec:fd.get("spec"),dept:fd.get("dept"),exp:fd.get("exp"),fee:fd.get("fee"),status:fd.get("status")});closeModal();notify("Doctor added successfully.");render();}
function doctorDetails(id){const d=state.doctors.find(x=>x.id===id);openModal("Doctor Profile",`<div class="profile-card"><div class="profile-banner"></div><div class="profile-main"><span class="avatar">${initials(d.name)}</span><div><h3>${esc(d.name)}</h3><p>${d.spec} · ${d.dept}</p>${badge(d.status)}</div></div><div class="info-grid"><div class="info-box"><small>Qualification</small><strong>MBBS, MD</strong></div><div class="info-box"><small>Experience</small><strong>${d.exp}</strong></div><div class="info-box"><small>Consultation Fee</small><strong>${d.fee}</strong></div><div class="info-box"><small>Today's Appointments</small><strong>8</strong></div></div></div>`);}
function renderDepartments(){
 const depts=["General Medicine","Cardiology","Dermatology","Pediatrics","Orthopedics","Neurology","ENT","Dental"];
 content.innerHTML=pageHead("DEPARTMENT MANAGEMENT","Departments","Manage clinical departments and view appointment volume.",`<button class="btn btn-primary" onclick="addDepartment()">+ Add Department</button>`)+
 `<div class="kpi-grid">${depts.slice(0,4).map((d,i)=>kpi(d,[42,31,26,19][i],"Appointments today","▤")).join("")}</div>
 <div class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Department</th><th>Doctors</th><th>Today's Appointments</th><th>Utilization</th><th>Status</th></tr></thead><tbody>${depts.map((d,i)=>`<tr><td><strong>${d}</strong></td><td>${[12,7,6,8,9,5,4,6][i]}</td><td>${[42,31,26,19,28,14,11,9][i]}</td><td><div class="progress"><span style="width:${[88,72,64,55,68,44,39,48][i]}%"></span></div></td><td>${badge("Active")}</td></tr>`).join("")}</tbody></table></div></div>`;
}
function addDepartment(){openModal("Add Department",`<label>Department Name<input id="deptName" placeholder="e.g. Ophthalmology"></label><label>Description<textarea rows="3" placeholder="Department description"></textarea></label>`,`<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" onclick="closeModal();notify('Department added successfully.')">Save Department</button>`);}
function renderAppointments(){
 content.innerHTML=pageHead("APPOINTMENT MANAGEMENT","Appointments","Coordinate scheduling, status changes and the daily patient flow.",`<button class="btn btn-primary" onclick="bookAppointment()">+ Book Appointment</button>`)+
 `<div class="card"><div class="card-body"><div class="filter-row"><input id="apptSearch" placeholder="Search appointment, patient or doctor..."><select id="apptStatus"><option>All statuses</option><option>Scheduled</option><option>Confirmed</option><option>Checked-In</option><option>In Consultation</option><option>Completed</option><option>Cancelled</option><option>No-Show</option></select></div></div></div>
 <div class="card table-card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Appointment</th><th>Patient</th><th>Doctor</th><th>Date / Time</th><th>Department</th><th>Status</th><th></th></tr></thead><tbody id="apptBody"></tbody></table></div></div>`;
 const fill=()=>{let q=(document.getElementById("apptSearch").value||"").toLowerCase(),s=document.getElementById("apptStatus").value;document.getElementById("apptBody").innerHTML=state.appointments.filter(a=>(s==="All statuses"||a.status===s)&&`${a.id} ${a.patient} ${a.doctor}`.toLowerCase().includes(q)).map(a=>`<tr><td><strong>${a.id}</strong></td><td>${a.patient}</td><td>${a.doctor}</td><td>${a.date}<br>${a.time}</td><td>${a.dept}</td><td>${badge(a.status)}</td><td><button class="btn btn-secondary" onclick="appointmentDetails('${a.id}')">View</button></td></tr>`).join("")};fill();document.getElementById("apptSearch").oninput=fill;document.getElementById("apptStatus").onchange=fill;
}
function bookAppointment(){
 openModal("Book Appointment",`<form id="apptForm"><div class="form-grid"><label>Department<select name="dept">${["General Medicine","Cardiology","Dermatology","Pediatrics","Orthopedics","Neurology","ENT","Dental"].map(x=>`<option>${x}</option>`).join("")}</select></label><label>Doctor<select name="doctor">${state.doctors.filter(d=>d.status==="Available").map(d=>`<option>${d.name}</option>`).join("")}</select></label><label>Patient<select name="patient">${state.patients.map(p=>`<option>${p.name}</option>`).join("")}</select></label><label>Date<input name="date" type="date" required></label><label>Time<select name="time"><option>09:00 AM</option><option>10:00 AM</option><option>11:30 AM</option><option>01:00 PM</option><option>02:30 PM</option><option>04:00 PM</option></select></label><label>Type<select name="type"><option>In-person</option><option>Follow-up</option></select></label><label class="full">Reason<textarea name="reason" rows="3" placeholder="Appointment reason"></textarea></label></div></form>`,`<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" onclick="saveAppointment()">Confirm Appointment</button>`);
}
function saveAppointment(){const f=document.getElementById("apptForm"),fd=new FormData(f);if(!f.reportValidity())return;const a={id:"APT-"+(3047+state.appointments.length),patient:fd.get("patient"),doctor:fd.get("doctor"),dept:fd.get("dept"),time:fd.get("time"),date:fd.get("date"),status:"Confirmed"};state.appointments.unshift(a);state.notifications.unshift({title:"Appointment Confirmed",text:`${a.id} with ${a.doctor} has been confirmed.`,time:"Just now"});closeModal();notify("Appointment confirmed.");render();}
function appointmentDetails(id){const a=state.appointments.find(x=>x.id===id);openModal(`Appointment ${a.id}`,`<div class="info-grid"><div class="info-box"><small>Patient</small><strong>${a.patient}</strong></div><div class="info-box"><small>Doctor</small><strong>${a.doctor}</strong></div><div class="info-box"><small>Department</small><strong>${a.dept}</strong></div><div class="info-box"><small>Date / Time</small><strong>${a.date} · ${a.time}</strong></div></div><label>Status<select id="apptNewStatus">${["Scheduled","Confirmed","Checked-In","In Consultation","Completed","Cancelled","No-Show"].map(s=>`<option ${s===a.status?"selected":""}>${s}</option>`).join("")}</select></label>`,`<button class="btn btn-secondary" data-close>Close</button><button class="btn btn-primary" onclick="updateAppointment('${a.id}')">Update Status</button>`);}
function updateAppointment(id){const a=state.appointments.find(x=>x.id===id);a.status=document.getElementById("apptNewStatus").value;closeModal();notify("Appointment status updated.");render();}
function renderAnalytics(){content.innerHTML=pageHead("OPERATIONAL ANALYTICS","Analytics","Monitor appointment volume, completion, workload and schedule utilization.","<button class='btn btn-secondary' onclick=\"notify('Report export prepared for demo.')\">Export Report</button>")+`
<div class="kpi-grid">${kpi("Appointments / Day","42","+12% vs last week","◷")}${kpi("Completion Rate","92%","+3.2% this month","✓")}${kpi("No-show Rate","2.4%","-0.8% this month","!")}${kpi("Schedule Utilization","78%","+5.1% this month","◒")}</div>
<div class="split-grid"><div class="card"><div class="card-head"><h3>Appointments per Day</h3><span>Last 7 days</span></div><div class="card-body"><div class="bar-chart">${[55,68,44,78,62,91,73].map((v,i)=>`<div class="bar-col"><div class="bar" style="height:${v}%"></div><small>${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</small></div>`).join("")}</div></div>
<div class="card"><div class="card-head"><h3>Department Workload</h3><span>Today</span></div><div class="card-body">${["General Medicine","Cardiology","Dermatology","Pediatrics","Orthopedics"].map((d,i)=>`<div style="margin:16px 0"><div style="display:flex;justify-content:space-between;font-size:10px"><strong>${d}</strong><span>${[88,72,64,55,68][i]}%</span></div><div class="progress"><span style="width:${[88,72,64,55,68][i]}%"></span></div></div>`).join("")}</div></div></div>`}
function renderActivity(){const acts=["Appointment created","Patient checked in","Consultation completed","Prescription added","Report uploaded","User login"];content.innerHTML=pageHead("AUDIT & ACTIVITY","Activity Logs","Track important operational actions without logging passwords, tokens or private medical records.")+`<div class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Action</th><th>User</th><th>Entity</th><th>Timestamp</th><th>Metadata</th></tr></thead><tbody>${acts.concat(acts).map((x,i)=>`<tr><td><strong>${x}</strong></td><td>${i%2?"Nisha Staff":"Admin User"}</td><td>${i%2?"Patient":"Appointment"}</td><td>2026-09-30 ${String(9+i).padStart(2,"0")}:2${i}</td><td>request_id=mc-${1000+i}</td></tr>`).join("")}</tbody></table></div></div>`}
function renderSystem(){content.innerHTML=pageHead("DEVOPS READINESS","System Status","Application health information designed for future containers, Kubernetes and monitoring integrations.")+`<div class="status-grid">
${["API Service","PostgreSQL Database","File Storage","Application Version","Environment","Uptime"].map((x,i)=>`<div class="status-card"><div class="status-head"><h4>${x}</h4><span class="health">${i<3?"● Healthy":"● Ready"}</span></div><strong>${["Healthy","Connected","Available","1.0.0","Development","14d 06h 32m"][i]}</strong><small>${["GET /api/health","Connection pool: 12/20","/uploads","medicore-web","NODE_ENV","Process uptime"][i]}</small>${i<3?'<div class="progress"><span style="width:94%"></span></div>':""}</div>`).join("")}</div>
<div class="card" style="margin-top:16px"><div class="card-head"><h3>Health Endpoint</h3><span>GET /api/health</span></div><div class="card-body"><pre style="margin:0;background:#0b1f3a;color:#d8e7fa;padding:18px;border-radius:8px;overflow:auto;font-size:11px">{
  "status": "healthy",
  "service": "medicore-api",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "${new Date().toISOString()}"
}</pre></div></div>`}
function renderSchedule(){content.innerHTML=pageHead("DOCTOR SCHEDULE","Schedule Management","Working hours, breaks and appointment slots for clinic operations.",`<button class="btn btn-primary" onclick="notify('Schedule saved for demo.')">Save Schedule</button>`)+`<div class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Day</th><th>Start</th><th>End</th><th>Break</th><th>Slot Duration</th><th>Status</th></tr></thead><tbody>${["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d,i)=>`<tr><td><strong>${d}</strong></td><td><input type="time" value="${i===5?"09:00":"09:00"}"></td><td><input type="time" value="${i===5?"13:00":"17:00"}"></td><td>${i===5?"—":"13:00 - 14:00"}</td><td>30 min</td><td>${badge(i===5?"On Leave":"Available")}</td></tr>`).join("")}</tbody></table></div></div>`}
function renderCheckin(){content.innerHTML=pageHead("OPERATIONS QUEUE","Check-in Queue","Move today’s appointments through the clinic workflow.",`<button class="btn btn-primary" onclick="notify('Queue refreshed.')">↻ Refresh</button>`)+`<div class="split-grid"><div class="card"><div class="card-head"><h3>Now Serving</h3><span>Room 204</span></div><div class="card-body" style="text-align:center;padding:35px"><div style="font-size:13px;color:var(--muted)">PATIENT</div><div style="font-size:30px;font-weight:800;margin:8px">#P1024</div><strong>Aarav Kulkarni</strong><p style="font-size:11px;color:var(--muted)">Dr. Sharma · General Medicine</p>${badge("In Consultation")}</div></div><div class="card"><div class="card-head"><h3>Waiting Queue</h3><span>4 patients</span></div><div class="card-body"><div class="queue">${state.appointments.filter(a=>["Checked-In","Confirmed","Scheduled"].includes(a.status)).slice(0,4).map((a,i)=>`<div class="queue-item"><span class="queue-number">${String(i+1).padStart(2,"0")}</span><div class="queue-info"><strong>${a.patient}</strong><small>${a.doctor} · ${a.time}</small></div>${badge(a.status)}</div>`).join("")}</div></div></div></div>`}
function renderPrescriptions(){content.innerHTML=pageHead("PRESCRIPTIONS","Prescriptions","View sample prescription records created during consultations.",`<button class="btn btn-primary" onclick="notify('Prescription editor opened for demo.')">+ New Prescription</button>`)+`<div class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Prescription</th><th>Patient</th><th>Doctor</th><th>Medicine</th><th>Instructions</th><th>Date</th></tr></thead><tbody>${[
["RX-8821","Aarav Kulkarni","Dr. Riya Sharma","Sample Medicine A","As recorded by doctor","30 Sep 2026"],
["RX-8820","Meera Joshi","Dr. Arjun Mehta","Sample Medicine B","As recorded by doctor","30 Sep 2026"],
["RX-8818","Rohan Patil","Dr. Neha Patil","Sample Medicine C","As recorded by doctor","29 Sep 2026"]
].map(r=>`<tr><td><strong>${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td></tr>`).join("")}</tbody></table></div></div>`}
function renderReports(){content.innerHTML=pageHead("MEDICAL REPORTS","Medical Reports","Sample report metadata and upload-ready UI. Files are not sent to an external service.",`<button class="btn btn-primary" onclick="uploadReport()">+ Upload Report</button>`)+`<div class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Report ID</th><th>Patient</th><th>Type</th><th>Uploaded By</th><th>Date</th><th>Notes</th></tr></thead><tbody>${[
["RPT-1041","Aarav Kulkarni","Lab Report","Dr. Riya Sharma","30 Sep 2026","Sample metadata"],
["RPT-1040","Meera Joshi","Consultation Report","Admin User","30 Sep 2026","Sample metadata"],
["RPT-1038","Rohan Patil","Lab Report","Nisha Staff","29 Sep 2026","Sample metadata"]
].map(r=>`<tr>${r.map((x,i)=>`<td>${i===0?`<strong>${x}</strong>`:x}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`}
function uploadReport(){openModal("Upload Medical Report",`<label>Patient<select>${state.patients.map(p=>`<option>${p.name}</option>`).join("")}</select></label><label>Report Type<select><option>Lab Report</option><option>Consultation Report</option><option>Medical Document</option></select></label><label>File<input type="file" accept=".pdf,.jpg,.jpeg,.png"></label><label>Notes<textarea rows="3"></textarea></label>`,`<button class="btn btn-secondary" data-close>Cancel</button><button class="btn btn-primary" onclick="closeModal();notify('Report metadata uploaded in demo mode.')">Upload</button>`);}
function renderNotifications(){content.innerHTML=pageHead("NOTIFICATIONS","Notifications","Appointment, schedule, prescription and follow-up updates.")+`<div class="card"><div class="card-body"><div class="activity">${state.notifications.map(n=>`<div class="activity-item"><span class="activity-icon">♢</span><div><strong>${n.title}</strong><small>${n.text}</small></div><span class="activity-time">${n.time}</span></div>`).join("")}</div></div></div>`}

document.getElementById("loginForm").addEventListener("submit",e=>{e.preventDefault();state.role=document.getElementById("loginRole").value;localStorage.setItem("medicore_role",state.role);document.getElementById("loginView").classList.add("hidden");document.getElementById("appView").classList.remove("hidden");state.page="dashboard";render();notify("Welcome to MediCore demo.");});
document.getElementById("menuToggle").onclick=()=>document.getElementById("sidebar").classList.toggle("open");
document.getElementById("sidebarClose").onclick=()=>document.getElementById("sidebar").classList.remove("open");
document.getElementById("notificationBtn").onclick=()=>openModal("Notifications",state.notifications.map(n=>`<div class="notice"><strong>${n.title}</strong><p>${n.text}<br>${n.time}</p></div>`).join(""));
document.getElementById("profileBtn").onclick=()=>{openModal("Account",`<div class="profile-card"><div class="profile-main" style="margin-top:0;padding:0"><span class="avatar">${roleMeta[state.role].initials}</span><div><h3>${roleMeta[state.role].name}</h3><p>${roleMeta[state.role].label}</p></div></div></div>`,`<button class="btn btn-danger" onclick="logout()">Sign out</button>`)};
document.getElementById("globalSearch").addEventListener("keydown",e=>{if(e.key==="Enter"){state.page=state.role==="admin"||state.role==="staff"?"patients":"doctors";render();setTimeout(()=>{const el=document.querySelector("#patientSearch, #apptSearch");if(el){el.value=e.target.value;el.dispatchEvent(new Event("input"));}},0);}});
function logout(){localStorage.removeItem("medicore_role");location.reload();}
if(state.role){document.getElementById("loginView").classList.add("hidden");document.getElementById("appView").classList.remove("hidden");render();}
