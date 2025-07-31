# Closet App

A simple web app for experimenting with AI-generated fashion descriptions and organizing your wardrobe.

## Pages
- **Home** – overview and welcome text.
- **My Closet** – upload clothing images, auto-generate a description, choose a season and store items locally.
- **Shop** – placeholder page for finding new looks.
- **Brand Ratings** – search top brands and view color-coded eco scores.
- **Ethics Info** – basic eco score table and tips on sustainable fashion.

The app uses vanilla HTML, CSS and JavaScript. A small Node.js server forwards image captioning requests to Hugging Face. Create a `.env` file with your `HUGGINGFACE_TOKEN` and run `npm start` to launch the server.
