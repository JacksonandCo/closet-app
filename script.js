
async function analyzeImage() {
  const input = document.getElementById("imageInput");
  const file = input.files[0];
  if (!file) {
    alert("Please upload an image.");
    return;
  }

  const reader = new FileReader();
  reader.onload = async function () {
    const base64Image = reader.result.split(',')[1];

    document.getElementById("result").innerText = "Scanning...";

    const response = await fetch("https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base", {
      method: "POST",
      headers: {
        // Insert your HuggingFace API token below
        "Authorization": "Bearer YOUR_HF_API_TOKEN",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: {
          image: base64Image
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      document.getElementById("result").innerText = "Error: " + data.error;
    } else if (data[0] && data[0].generated_text) {
      document.getElementById("result").innerText = "Description: " + data[0].generated_text;
    } else {
      document.getElementById("result").innerText = "Could not get a description.";
    }
  };

  reader.readAsDataURL(file);
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
    card.innerHTML = `<img src="${item.image}" alt="item"><p>${item.tags}</p>` +
      `<button onclick="deleteClosetItem(${index})">Delete</button>`;
    container.appendChild(card);
  });
}

function addClosetItem() {
  const fileInput = document.getElementById('closetImage');
  const tagsInput = document.getElementById('closetTags');
  const file = fileInput.files[0];
  if (!file) {
    alert('Choose an image');
    return;
  }
  const reader = new FileReader();
  reader.onload = function () {
    const items = JSON.parse(localStorage.getItem('closet') || '[]');
    items.push({ image: reader.result, tags: tagsInput.value });
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

window.addEventListener('DOMContentLoaded', loadCloset);
