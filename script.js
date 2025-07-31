
async function analyzeImage() {
  const input = document.getElementById("imageInput");
  const file = input.files[0];
  if (!file) {
    alert("Please upload an image.");
    return;
  }

  const reader = new FileReader();
  reader.onload = async function () {
    const desc = await captionImage(reader.result);
    document.getElementById("result").innerText = "Description: " + desc;
  };

  reader.readAsDataURL(file);
}

async function captionImage(dataUrl) {
  const base64Image = dataUrl.split(',')[1];
  try {
    const response = await fetch('/caption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image })
    });

    const data = await response.json();
    if (data.description) {
      return data.description;
    }
    return 'No description';
  } catch (e) {
    console.error(e);
    return "Description unavailable";
  }
}

let pendingImage = null;
let pendingDesc = '';

// Closet functionality
function loadCloset() {
  const container = document.getElementById('closetContainer');
  if (!container) return;
  container.innerHTML = '';
  const items = JSON.parse(localStorage.getItem('closet') || '[]');
  const byCat = {};
  items.forEach((item, index) => {
    const cat = item.category || 'Misc';
    if (!byCat[cat]) byCat[cat] = [];
    byCat[cat].push({ item, index });
  });
  Object.keys(byCat).forEach(cat => {
    const details = document.createElement('details');
    details.className = 'category';
    const summary = document.createElement('summary');
    summary.textContent = cat;
    details.appendChild(summary);
    const collage = document.createElement('div');
    collage.className = 'collage';
    byCat[cat].forEach(({ item, index }) => {
      const card = document.createElement('div');
      card.className = 'closet-card';
      card.innerHTML =
        `<img src="${item.image}" alt="item">` +
        `<p>${item.description}</p>` +
        `<button onclick="deleteClosetItem(${index})">Delete</button>`;
      card.addEventListener('click', () => {
        card.classList.toggle('active');
      });
      collage.appendChild(card);
    });
    details.appendChild(collage);
    container.appendChild(details);
  });
}

function addClosetItem() {
  const fileInput = document.getElementById('closetImage');
  const file = fileInput.files[0];
  if (!file) {
    alert('Choose an image');
    return;
  }
  const reader = new FileReader();
  reader.onload = async function () {
    const desc = await captionImage(reader.result);
    showModal(reader.result, desc);
  };
  reader.readAsDataURL(file);
}

function deleteClosetItem(index) {
  const items = JSON.parse(localStorage.getItem('closet') || '[]');
  items.splice(index, 1);
  localStorage.setItem('closet', JSON.stringify(items));
  loadCloset();
}

function showModal(img, desc) {
  pendingImage = img;
  pendingDesc = desc;
  document.getElementById('modalImage').src = img;
  document.getElementById('modalDesc').innerText = desc;
  document.getElementById('modalCategory').value = '';
  document.getElementById('modal').style.display = 'flex';
}

function hideModal() {
  document.getElementById('modal').style.display = 'none';
}

function saveModalItem() {
  const cat = document.getElementById('modalCategory').value || 'Misc';
  const items = JSON.parse(localStorage.getItem('closet') || '[]');
  items.push({ image: pendingImage, description: pendingDesc, category: cat });
  localStorage.setItem('closet', JSON.stringify(items));
  document.getElementById('closetImage').value = '';
  hideModal();
  loadCloset();
  loadRecents();
}

function loadRecents() {
  const container = document.getElementById('recentUploads');
  if (!container) return;
  const items = JSON.parse(localStorage.getItem('closet') || '[]');
  const recent = items.slice(-4).reverse();
  container.innerHTML = '';
  recent.forEach(item => {
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = 'recent';
    img.className = 'recent-thumb';
    container.appendChild(img);
  });
}

function loadGreeting() {
  const span = document.getElementById('userName');
  if (!span) return;
  let name = localStorage.getItem('userName');
  if (!name) {
    name = prompt('Enter your name');
    if (name) localStorage.setItem('userName', name);
  }
  span.textContent = name || 'friend';
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('saveButton')?.addEventListener('click', saveModalItem);
  loadCloset();
  loadBrands();
  loadRecents();
  loadGreeting();
});

let allBrands = [];

async function loadBrands() {
  const container = document.getElementById('brandList');
  if (!container) return;
  const res = await fetch('brands.json');
  allBrands = await res.json();
  document.getElementById('brandSearch').addEventListener('input', renderBrands);
  document.getElementById('scoreFilter').addEventListener('change', renderBrands);
  renderBrands();
}

function renderBrands() {
  const container = document.getElementById('brandList');
  if (!container) return;
  const query = document.getElementById('brandSearch').value.toLowerCase();
  const score = document.getElementById('scoreFilter').value;
  container.innerHTML = '';
  allBrands
    .filter(b => b.name.toLowerCase().includes(query))
    .filter(b => {
      if (!score) return true;
      if (score === 'A+') return b.score === 'A+' || b.score === 'A';
      return b.score === score;
    })
    .forEach(b => {
      const card = document.createElement('div');
      card.className = 'brand-card';
      const scoreClass = b.score.replace('+','plus');
      card.innerHTML = `<h3>${b.name}</h3>` +
        `<div class="score ${scoreClass}">${b.score}</div>` +
        `<p>${b.reason}</p>`;
      container.appendChild(card);
    });
}
