
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
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
      {
        method: "POST",
        headers: {
          // Insert your HuggingFace API token below
          Authorization: "Bearer YOUR_HF_API_TOKEN",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: { image: base64Image } }),
      }
    );

    const data = await response.json();
    if (data[0] && data[0].generated_text) {
      return data[0].generated_text;
    }
    return "No description";
  } catch (e) {
    console.error(e);
    return "Description unavailable";
  }
}

// Closet functionality
function loadCloset() {
  const container = document.getElementById('closetItems');
  if (!container) return;
  const items = JSON.parse(localStorage.getItem('closet') || '[]');
  container.innerHTML = '';
  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'closet-card';
    card.innerHTML =
      `<img src="${item.image}" alt="item">` +
      `<p>${item.description}</p>` +
      `<span>${item.folder}</span>` +
      `<button onclick="deleteClosetItem(${index})">Delete</button>`;
    container.appendChild(card);
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
      folder: seasonSelect.value,
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
