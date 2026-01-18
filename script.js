// ==================== PASSWORD SYSTEM ====================
const pwScreen = document.getElementById('passwordScreen');
const mainContent = document.getElementById('mainContent');
const unlockBtn = document.getElementById('unlockBtn');
const pwInput = document.getElementById('sitePassword');
const pwMessage = document.getElementById('pwMessage');

function generatePassword() {
  const day3 = Math.floor(Date.now() / (1000*60*60*24*3));
  return btoa(day3).slice(-6);
}

function unlockSite() {
  pwScreen.style.display = 'none';
  mainContent.style.display = 'block';
}

// Unlock button click
unlockBtn.addEventListener('click', () => {
  if(pwInput.value === generatePassword()) unlockSite();
  else pwMessage.textContent = "Incorrect password 🔒";
});

// ==================== TAB SYSTEM ====================
const tabBtns = document.querySelectorAll('.tabBtn');
const tabContents = document.querySelectorAll('.tabContent');
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabContents.forEach(t => t.style.display='none');
    document.getElementById(btn.dataset.tab).style.display='block';
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});
tabBtns[0].click(); // default first tab

// ==================== QUILL SCRIPT EDITOR ====================
const quill = new Quill('#editor', { theme: 'snow' });

// ==================== SCRIPT UPLOAD ====================
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const ext = file.name.split('.').pop().toLowerCase();

  if(ext==='txt'||ext==='md'){ 
    const text = await file.text(); 
    filePreview.textContent = text; 
    quill.setText(text); 
  } else if(ext==='json'){ 
    const text = await file.text(); 
    filePreview.textContent = text; 
    quill.setText(text); 
  } else if(ext==='docx'){ 
    const arrayBuffer = await file.arrayBuffer(); 
    mammoth.extractRawText({arrayBuffer}).then(r=>{
      filePreview.textContent = r.value;
      quill.setText(r.value);
    }); 
  } else filePreview.textContent = "Unsupported file type.";
});

// ==================== MEDIA MEMORY ====================
const mediaInput = document.getElementById('mediaInput');
const mediaPreview = document.getElementById('mediaPreview');
let mediaFiles = [];

// Upload new media
mediaInput.addEventListener('change', e => {
  mediaPreview.innerHTML = '';
  mediaFiles = [];
  for(let file of e.target.files){
    const reader = new FileReader();
    reader.onload = () => {
      let el;
      if(file.type.startsWith('image')) el = document.createElement('img');
      else if(file.type.startsWith('video')) { el = document.createElement('video'); el.controls = true; }
      el.src = reader.result;
      mediaPreview.appendChild(el);
      mediaFiles.push(reader.result);
    }
    reader.readAsDataURL(file);
  }
});

// Download media JSON
document.getElementById('downloadMedia').addEventListener('click',()=>{
  const blob = new Blob([JSON.stringify({media:mediaFiles},null,2)],{type:"application/json;charset=utf-8"});
  saveAs(blob,"media.json");
});

// ==================== CAST & CREW ====================
const castInput = document.getElementById('castInput');
const castPreview = document.getElementById('castPreview');
const addCastBtn = document.getElementById('addCast');
let castList = [];

function renderCast(){
  castPreview.innerHTML = '';
  if(castList.length === 0){ castPreview.textContent="No cast members yet."; return; }

  const table = document.createElement('table');
  table.innerHTML = "<tr><th>Name</th><th>Role</th><th>Remove</th></tr>";
  castList.forEach((m,i)=>{
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input value="${m.name}" data-index="${i}" data-field="name"></td>
      <td><input value="${m.role}" data-index="${i}" data-field="role"></td>
      <td><button data-index="${i}">❌</button></td>
    `;
    table.appendChild(row);
  });
  castPreview.appendChild(table);

  // Input changes
  castPreview.querySelectorAll('input').forEach(input=>{
    input.addEventListener('input', e=>{
      const idx = e.target.dataset.index;
      const field = e.target.dataset.field;
      castList[idx][field] = e.target.value;
    });
  });

  // Remove buttons
  castPreview.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', e=>{
      castList.splice(e.target.dataset.index,1);
      renderCast();
    });
  });
}

// Add new cast member
addCastBtn.addEventListener('click',()=>{
  castList.push({name:"New Actor", role:"Role"});
  renderCast();
});

// Upload cast JSON
castInput.addEventListener('change', async e=>{
  const file = e.target.files[0]; if(!file) return;
  const text = await file.text();
  castList = JSON.parse(text);
  renderCast();
});

// ==================== SCRIPT FORMATTING ====================
function formatScript(text) {
  const lines = text.split("\n");
  let sceneCount = 0;
  return lines.map(line=>{
    line = line.trim();
    if(/^scene\s*\d*:?/i.test(line) || /^scenes?\s*:/i.test(line)){
      sceneCount++; line = `SCENE ${sceneCount}: ${line.replace(/^scene\s*\d*:?\s*/i,'')}`;
      return line.toUpperCase();
    }
    if(/^[A-Z\s]+$/.test(line) && line.length>0 && line.length<30) return line+":";
    if(line.length>0 && !line.startsWith("SCENE") && !/^[A-Z\s]+:/.test(line)) return "    "+line;
    return line;
  }).join("\n");
}
function getFormattedScript(){ return formatScript(quill.getText()); }

// ==================== DOWNLOAD PDF ====================
document.getElementById('downloadPdf').addEventListener('click', ()=>{
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF(); let y=10;
  const lines = doc.splitTextToSize(getFormattedScript(),180);
  for(let line of lines){ if(y>280){doc.addPage(); y=10;} doc.text(line,10,y); y+=7; }

  // Cast
  if(castList.length>0){
    if(y>270){doc.addPage(); y=10;}
    doc.text("Cast & Crew:",10,y); y+=10;
    castList.forEach(m=>{ if(y>280){doc.addPage();y=10;} doc.text(`${m.name} - ${m.role}`,10,y); y+=7; });
  }

  // Media
  mediaFiles.forEach(img=>{
    if(y>250){doc.addPage(); y=10;}
    doc.addImage(img,'JPEG',10,y,180,100); y+=105;
  });

  doc.save('movie-hub.pdf');
});

// ==================== DOWNLOAD TEXT ====================
document.getElementById('downloadText').addEventListener('click',()=>{
  const blob = new Blob([quill.getText()],{type:"text/plain;charset=utf-8"});
  saveAs(blob,"movie-hub.txt");
});

// ==================== DOWNLOAD CAST JSON ====================
document.getElementById('downloadCast').addEventListener('click',()=>{
  const blob = new Blob([JSON.stringify(castList,null,2)],{type:"application/json;charset=utf-8"});
  saveAs(blob,"cast.json");
});
