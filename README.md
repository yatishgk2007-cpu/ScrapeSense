<div align="center">🚀 ScrapeSense

🕷️ AI-Powered Product Intelligence Platform

<p>
Turn raw Amazon product data into simple, useful and AI-powered insights.
</p>

<p>
<b>🕷️ Bright Data</b> &nbsp; • &nbsp;
<b>🤖 Groq AI</b> &nbsp; • &nbsp;
<b>⚛️ React</b> &nbsp; • &nbsp;
<b>🟢 Node.js</b> &nbsp; • &nbsp;
<b>🎨 Tailwind CSS</b>
</p>

<p>
🏆 Built for <b>Scrape-Verse</b> by <b>WeMakeDevs</b>
</p>

<p>
<strong>👨‍💻 Built by Yatish G K</strong>
</p>

</div>

💡 What is ScrapeSense?

ScrapeSense is an AI-powered product intelligence application that takes an Amazon product URL, extracts structured product information using Bright Data, and transforms that data into easy-to-understand insights using AI.

Instead of manually going through a product page, checking prices, ratings, reviews and other information, ScrapeSense brings the important information together in one place.

🔗 Paste a product URL → 🕷️ Scrape the data → 🤖 Analyze it → 📊 Understand the product faster.

🎯 The Problem

Online product research can be time-consuming.

A user may need to:

🔎 Search through product pages

💰 Check prices

⭐ Check ratings

📝 Read reviews

📊 Compare product information

🤔 Decide whether the product is worth considering

💡 Our Idea

What if a user could simply provide a product URL and get the important information and AI-powered analysis in one place?

That's what ScrapeSense aims to do.

⚙️ How ScrapeSense Works

ScrapeSense follows a simple pipeline:

                    Amazon Product URL
                            |
                            v
                   React + Vite Frontend
                            |
                            v
                 Node.js + Express Backend
                            |
                            v
                 Bright Data Amazon Scraper
                            |
                            v
                  Structured Product Data
                            |
                            v
                     Groq AI Analysis
                            |
                            v
                  ScrapeSense Product
                     Intelligence

🔄 Process

1️⃣ 👤 User enters an Amazon product URL

The user provides the product page they want to analyze.

2️⃣ 💻 Frontend sends the request

The React/Vite frontend communicates with the Node.js/Express backend.

3️⃣ 🕷️ Bright Data collects product data

The backend uses the Bright Data Amazon product scraper to retrieve structured information from the product page.

4️⃣ 📦 Structured product data is received

The application receives available product information such as title, price, rating, reviews and other product fields.

5️⃣ 🤖 AI analyzes the information

The relevant product data is sent to the AI analysis layer through the Groq API.

6️⃣ 📊 Product intelligence is displayed

ScrapeSense presents the processed information in an easy-to-understand dashboard.

🕷️ How Bright Data Is Used

Bright Data is a core part of ScrapeSense.

We use Bright Data's Amazon product scraping capability to retrieve structured product information from the web.

This allows ScrapeSense to work with real product data instead of requiring users to manually enter product information.

🔄 Data Flow

            Amazon Product Page
                    |
                    v
            Product URL
                    |
                    v
            Bright Data Amazon Scraper
                    |
                    v
            Structured Product Data
                    |
                    v
                AI Analysis
                    |
                    v
            Product Insights

The repository also includes structured output from the Bright Data Scraper Studio workflow:

            scraper-output/
                    |
                    v
            sample-product.json

🤖 AI-Powered Analysis

ScrapeSense does more than simply collect raw data.

After the product information is retrieved, relevant data is sent to the AI layer through the Groq API.

🧠 AI-assisted insights can include:

📌 Product summary

💰 Price information

⭐ Ratings

📝 Review information

👍 Potential strengths

👎 Potential weaknesses

💡 Buying-oriented insights

✨ Features

<table>
<tr>
<td><strong>🕷️ Web Scraping</strong><br>Extract Amazon product information using Bright Data.</td>
<td><strong>📦 Structured Data</strong><br>Work with structured product information.</td>
</tr>
<tr>
<td><strong>🤖 AI Analysis</strong><br>Generate useful insights from product data.</td>
<td><strong>💰 Price Information</strong><br>Display product pricing.</td>
</tr>
<tr>
<td><strong>⭐ Ratings & Reviews</strong><br>Present rating and review information.</td>
<td><strong>📊 Product Intelligence</strong><br>Bring important information together.</td>
</tr>
<tr>
<td><strong>🌐 Modern UI</strong><br>React + Tailwind based interface.</td>
<td><strong>⚡ Fast Backend</strong><br>Node.js + Express API.</td>
</tr>
</table>

🛠️ Tech Stack

<table>
<tr>
<td>🎨 <strong>Frontend</strong></td>
<td>⚛️ React · ⚡ Vite · 🎨 Tailwind CSS · 🟨 JavaScript</td>
</tr>
<tr>
<td>⚙️ <strong>Backend</strong></td>
<td>🟢 Node.js · 🚂 Express.js · 🔌 REST API</td>
</tr>
<tr>
<td>🕷️ <strong>Web Data</strong></td>
<td>🕷️ Bright Data · 🛒 Amazon Product Scraper · 🧪 Scraper Studio</td>
</tr>
<tr>
<td>🤖 <strong>AI</strong></td>
<td>🤖 Groq API · 💬 OpenAI-compatible Chat Completions API</td>
</tr>
<tr>
<td>🚀 <strong>Development</strong></td>
<td>🌱 Git · 🐙 GitHub · ▲ Vercel · ☁️ Backend hosting</td>
</tr>
</table>

📁 Project Structure

            ScrapeSense/
            │
            ├── 🎨 client/                       # React + Vite frontend
            │   ├── 📂 src/                      # Application source code
            │   ├── 📂 public/                   # Public assets
            │   ├── 📄 package.json              # Frontend dependencies
            │   └── ...
            │
            ├── ⚙️ server/                       # Node.js + Express backend
            │   ├── 📂 ...                        # API & backend logic
            │   └── 📄 package.json              # Backend dependencies
            │
            ├── 🕷️ scraper-output/              # Bright Data scraper evidence
            │   └── 📄 sample-product.json       # Structured Scraper Studio output
            │
            ├── 📖 README.md                     # Project documentation
            ├── 🔒 .gitignore                    # Files excluded from Git
            ├── 📦 package.json                  # Project configuration
            └── 🔐 package-lock.json             # Locked dependency versions

🧩 What each part does

📂 Part

🎯 Purpose

🎨 client/

User interface built with React + Vite

⚙️ server/

Backend API and application logic

🕷️ scraper-output/

Structured output generated through Bright Data Scraper Studio

📖 README.md

Documentation, setup and project workflow

🔒 .gitignore

Keeps sensitive/unnecessary files out of Git

📦 Scraper Studio Output

The project includes structured output generated from the Bright Data Scraper Studio workflow.

The structured data can contain fields such as:

{
  "title": "Product title",
  "brand": "Brand",
  "initial_price": 0,
  "final_price": 0,
  "currency": "USD",
  "availability": "In Stock",
  "rating": 0,
  "reviews_count": 0,
  "asin": "PRODUCT_ASIN",
  "url": "PRODUCT_URL"
}

The repository contains the actual scraper output here:

scraper-output/
        |
        +-- sample-product.json

✅ This structured JSON is included as part of the Scrape-Verse submission evidence.

<details>
<summary>🔎 Why structured output matters</summary>

The scraper output gives the application structured product information that can be processed by the backend and passed to the AI analysis layer.

This creates a clear pipeline from web data extraction to useful product intelligence.

</details>

🚀 Getting Started

📋 Prerequisites

🟢 Node.js

📦 npm

🌱 Git

1️⃣ 📥 Clone the Repository

git clone https://github.com/yatishgk2007-cpu/ScrapeSense.git
cd ScrapeSense

2️⃣ 📦 Install Backend Dependencies

cd server
npm install

3️⃣ 📦 Install Frontend Dependencies

Open another terminal:

cd client
npm install

🔐 Environment Variables

Create the required environment variables for the backend.

BRIGHTDATA_API_KEY=your_bright_data_api_key
GROQ_API_KEY=your_groq_api_key

⚠️ Never upload your real API keys to GitHub.

<details>
<summary>🔐 Environment variable reminder</summary>

Keep your .env file local and make sure it is included in .gitignore.

</details>

▶️ Running the Application

⚙️ Start the Backend

From the server directory:

npm run dev

🎨 Start the Frontend

From the client directory:

npm run dev

Then open the local URL provided by Vite.

🧪 Using ScrapeSense

Amazon Product URL
        |
        v
Bright Data Scraping
        |
        v
Structured Product Data
        |
        v
AI Analysis
        |
        v
ScrapeSense Dashboard

1️⃣ 🔗 Enter a Product URL

Open ScrapeSense and paste an Amazon product URL.

2️⃣ 🚀 Start the Analysis

Start the product analysis.

3️⃣ 🕷️ Retrieve Product Data

Bright Data retrieves the available product information.

4️⃣ 📦 Process Structured Data

The backend receives and processes the scraped data.

5️⃣ 🤖 Analyze with AI

The product information is sent to the AI analysis layer.

6️⃣ 📊 View Product Intelligence

Review the resulting product information and AI-generated insights in the dashboard.

🎥 Demo

🎬 Demo coming soon

The project demo video will be added here after the final recording.

📌 Demo link: Will be added before final submission.

The demo will show the complete journey:

Amazon Product URL
        |
        v
Bright Data Scraping
        |
        v
Structured Product Data
        |
        v
AI Analysis
        |
        v
ScrapeSense Dashboard

🧠 What I Learned

Building ScrapeSense helped me understand how different parts of a real-world application work together.

📚 Key areas explored

🌐 Web scraping

🔗 API integration

⚙️ Backend development

🧩 Frontend/backend communication

🤖 AI integration

📦 Structured data processing

🚀 Deployment

🔐 Environment variables

🌱 Git & GitHub

The most interesting part was connecting:

Web Data Extraction
        |
        v
Backend Processing
        |
        v
AI Analysis
        |
        v
Frontend Visualization

into one working application.

🔮 Future Improvements

🔄 Multi-product comparison

📈 Historical price tracking

🧠 Deeper review sentiment analysis

🛒 Support for additional e-commerce platforms

🎯 Personalized product recommendations

📊 Product trend analysis

🧾 More detailed review intelligence

🏆 Built for Scrape-Verse

🚀 ScrapeSense was built for the Scrape-Verse Hackathon by <mark>WeMakeDevs</mark>, using <mark>Bright Data</mark> for web data extraction.

🕷️ Bright Data powers the web data extraction layer.
👨‍💻 WeMakeDevs organized the Scrape-Verse hackathon.
🚀 Yatish G K built ScrapeSense as the project author.

🙌 Special Thanks

🕷️ <mark><strong>Bright Data</strong></mark>
For providing powerful web data extraction capabilities.

👨‍💻 <mark><strong>WeMakeDevs</strong></mark>
For organizing the Scrape-Verse hackathon and creating the opportunity to build with web data.

👨‍💻 Author

⭐ <mark>Yatish G K</mark>

Creator & Developer of ScrapeSense

Built with:

💡 Curiosity · 🧠 Learning · 💻 Code · 🐛 Debugging · 🚀 Experimentation

🕷️ Scrape Smart. 🤖 Analyze Smarter. 📊 Decide Better. 🚀

🏆 Built for Scrape-Verse · 🕷️ Powered by <mark>Bright Data</mark> · 👨‍💻 Organized by <mark>WeMakeDevs</mark> · 🚀 Built by <mark>Yatish G K</mark>