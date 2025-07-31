
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

// Closet functionality
function loadCloset() {
  const sections = {
    Winter: document.getElementById('WinterSection'),
    Fall: document.getElementById('FallSection'),
    Spring: document.getElementById('SpringSection'),
    Summer: document.getElementById('SummerSection')
  };
  Object.values(sections).forEach(sec => sec && (sec.innerHTML = ''));
  const items = JSON.parse(localStorage.getItem('closet') || '[]');
  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'closet-card';
    card.innerHTML =
      `<img src="${item.image}" alt="item">` +
      `<p>${item.description}</p>` +
      `<button onclick="deleteClosetItem(${index})">Delete</button>`;
    card.addEventListener('click', () => {
      card.classList.toggle('active');
    });
    const sec = sections[item.season];
    if (sec) sec.appendChild(card);
  });
}

function addClosetItem() {
  const fileInput = document.getElementById('closetImage');
  const tagsInput = document.getElementById('closetTags');
  const seasonSelect = document.getElementById('closetSeason');
  const file = fileInput.files[0];
  if (!file) {
    alert('Choose an image');
    return;
  }
  const reader = new FileReader();
  reader.onload = async function () {
    const items = JSON.parse(localStorage.getItem('closet') || '[]');
    const desc = await captionImage(reader.result);
    items.push({
      image: reader.result,
      description: desc,
      season: seasonSelect.value,
      tags: tagsInput.value,
    });
    localStorage.setItem('closet', JSON.stringify(items));
    fileInput.value = '';
    tagsInput.value = '';
    loadCloset();
  };
  reader.readAsDataURL(file);
}

function deleteClosetItem(index) {
  const items = JSON.parse(localStorage.getItem('closet') || '[]');
  items.splice(index, 1);
  localStorage.setItem('closet', JSON.stringify(items));
  loadCloset();
}

window.addEventListener('DOMContentLoaded', () => {
  loadCloset();
  loadBrands();
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
