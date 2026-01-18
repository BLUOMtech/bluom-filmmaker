// === PASSWORD & SESSION MEMORY ===
const pwScreen = document.getElementById('passwordScreen');
const mainContent = document.getElementById('mainContent');
const unlockBtn = document.getElementById('unlockBtn');
const pwInput = document.getElementById('sitePassword');
const pwMessage = document.getElementById('pwMessage');

function generatePassword() {
  const day3 = Math.floor(Date.now() / (1000*60*60*24*3));
  return btoa(day3).slice(-6);
}

unlockBtn.addEventListener('click', () => {
  if(pwInput.value === generatePassword()) {
    pwScreen.style.display = 'none';
    mainContent.style.display = 'block';
    localStorage.setItem('blMovieHubUnlocked', 'true');
  } else {
    pwMessage.textContent = "Incorrect password! 🔒";
  }
});

// Auto-unlock if previously unlocked
if(localStorage.getItem('blMovieHubUnlocked') === 'true' && pwInput.value === generatePassword()) {
  pwScreen.style.display = 'none';
  mainContent.style.display = 'block';
}

// === SAVE SCRIPT + CAST + MEDIA ===
const quill = new Quill('#editor', { theme: 'snow' });
const fileInput = document.getElementById('fileInput');

// Load saved script
if(localStorage.getItem('blMovieHubScript')) {
  quill.setText(localStorage.getItem('blMovieHubScript'));
}
quill.on('text-change', () => {
  localStorage.setItem('blMovieHubScript', quill.getText());
});

// Cast & Crew storage
let castList = [];
if(localStorage.getItem('blMovieHubCast')) {
  castList = JSON.parse(localStorage.getItem('blMovieHubCast'));
  renderCast(); // call your render function
}
function saveCast() {
  localStorage.setItem('blMovieHubCast', JSON.stringify(castList));
}
// Call saveCast() after adding/removing/updating cast members

// Media storage
let mediaFiles = [];
if(localStorage.getItem('blMovieHubMedia')) {
  mediaFiles = JSON.parse(localStorage.getItem('blMovieHubMedia'));
  // render previews from mediaFiles
}
function saveMedia() {
  localStorage.setItem('blMovieHubMedia', JSON.stringify(mediaFiles));
}
// Call saveMedia() after adding/removing media
