
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
        "Authorization": "Bearer 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",
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
