🚀 ScrapeSense

<h3 align="center">🕷️ AI-Powered Product Intelligence Platform</h3>

<p align="center">
  Turn raw Amazon product data into simple, useful and AI-powered insights.
</p>

<p align="center">
  🕷️ <b>Bright Data</b> &nbsp; • &nbsp;
  🤖 <b>Groq AI</b> &nbsp; • &nbsp;
  ⚛️ <b>React</b> &nbsp; • &nbsp;
  🟢 <b>Node.js</b> &nbsp; • &nbsp;
  🎨 <b>Tailwind CSS</b>
</p>

💡 What is ScrapeSense?

ScrapeSense is an AI-powered product intelligence application that takes an Amazon product URL, extracts structured product information using Bright Data, and transforms that data into easy-to-understand product insights using AI.

Instead of manually going through a product page, checking prices, ratings, reviews and other information, ScrapeSense brings the important information together in one place.

🔗 Paste a product URL → 🕷️ Scrape the data → 🤖 Analyze it with AI → 📊 Understand the product faster.

🎯 The Problem

Online product research can be time-consuming.

A user may have to:

🔎 Search through product pages

💰 Check prices

⭐ Check ratings

📝 Read reviews

📊 Compare product information

🤔 Decide whether the product is worth considering

The information is available, but it is not always easy to process quickly.

💡 Our Idea

What if a user could simply provide the product URL and get the important information and AI-powered analysis in one place?

That's what ScrapeSense aims to do.

⚙️ How ScrapeSense Works

flowchart LR
    A["👤 User<br/>Amazon Product URL"]
    B["💻 React + Vite<br/>Frontend"]
    C["⚙️ Node.js + Express<br/>Backend"]
    D["🕷️ Bright Data<br/>Amazon Product Scraper"]
    E["📦 Structured<br/>Product Data"]
    F["🤖 Groq AI<br/>Analysis"]
    G["📊 ScrapeSense<br/>Product Intelligence"]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G

🔄 Step-by-Step Workflow

1️⃣ 👤 User enters an Amazon URL

The user provides the product page they want to analyze.

⬇️

2️⃣ 💻 Frontend sends the request

The React/Vite application communicates with the backend.

⬇️

3️⃣ 🕷️ Bright Data collects the product data

The backend uses the Bright Data Amazon product scraper to retrieve structured information from the product page.

⬇️

4️⃣ 📦 Structured data is received

Product information such as price, rating, reviews and other available fields are returned as structured data.

⬇️

5️⃣ 🤖 AI analyzes the information

The product data is passed to the AI layer through the Groq API.

⬇️

6️⃣ 📊 Product intelligence is displayed

ScrapeSense presents the processed information in an easy-to-understand interface.

🕷️ How We Use Bright Data

Bright Data is a core part of ScrapeSense.

We use Bright Data's Amazon product scraping capability to collect structured product information from the web.

Instead of manually collecting product information, ScrapeSense retrieves the data programmatically.

🔄 Data Pipeline

🛒 Amazon Product Page
        │
        ▼
🔗 Product URL
        │
        ▼
🕷️ Bright Data
Amazon Product Scraper
        │
        ▼
📦 Structured Product Data
        │
        ▼
🤖 AI Analysis
        │
        ▼
📊 Product Insights

The repository also contains structured output generated from the scraper:

📂 scraper-output/
└── 📄 sample-product.json

🤖 AI-Powered Analysis

ScrapeSense does more than simply collect raw data.

After the product information is retrieved, the application sends the relevant data to the AI layer for analysis through the Groq API.

This helps turn raw product information into information that is easier for a user to understand.

🧠 AI-assisted insights can include:

📌 Product summary

💰 Price information

⭐ Ratings

📝 Review information

👍 Potential strengths

👎 Potential weaknesses

💡 Buying-oriented insights

✨ Features

Feature

Description

🕷️ Web Scraping

Extract Amazon product information using Bright Data

📦 Structured Data

Work with structured product information

🤖 AI Analysis

Generate useful insights from product data

💰 Price Information

Display product pricing

⭐ Ratings & Reviews

Present rating and review information

📊 Product Intelligence

Bring important information together

🌐 Modern UI

React + Tailwind based interface

⚡ Fast Backend

Node.js + Express API

🇮🇳 INR Display

Product prices can be displayed in ₹

🛠️ Tech Stack

🎨 Frontend

⚛️ React

⚡ Vite

🎨 Tailwind CSS

🟨 JavaScript

⚙️ Backend

🟢 Node.js

🚂 Express.js

🔌 REST API

🕷️ Web Data

🕷️ Bright Data

🛒 Amazon Product Scraper

🧪 Scraper Studio

🤖 AI

🤖 Groq API

💬 OpenAI-compatible Chat Completions API

🚀 Development & Deployment

🌱 Git

🐙 GitHub

▲ Vercel

☁️ Backend hosting

📁 Project Structure

ScrapeSense/
│
├── 📂 client/
│   ├── 📂 src/
│   ├── 📂 public/
│   ├── 📄 package.json
│   └── ...
│
├── 📂 server/
│   ├── ...
│   └── 📄 package.json
│
├── 📂 scraper-output/
│   └── 📄 sample-product.json
│
├── 📄 README.md
├── 📄 .gitignore
├── 📄 package.json
└── 📄 package-lock.json

📦 Scraper Studio Output

The project includes structured output generated from the Bright Data Scraper Studio workflow.

The structured data can contain product information such as:

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

📁 Actual structured output:

📂 scraper-output/
└── 📄 sample-product.json

✅ The JSON file in this repository is the actual structured scraper output used as evidence for the Scrape-Verse submission.

🚀 Getting Started

📋 Prerequisites

Make sure you have installed:

🟢 Node.js

📦 npm

🌱 Git

1️⃣ 📥 Clone the Repository

git clone https://github.com/yatishgk2007-cpu/ScrapeSense.git
cd ScrapeSense

2️⃣ 📦 Install Dependencies

⚙️ Backend

cd server
npm install

🎨 Frontend

Open another terminal:

cd client
npm install

🔐 Environment Variables

Create the required environment variables for the backend.

Example:

BRIGHTDATA_API_KEY=your_bright_data_api_key
GROQ_API_KEY=your_groq_api_key

⚠️ Never upload your real API keys to GitHub.

▶️ Running the Application

⚙️ Start the Backend

From the server directory:

npm run dev

🎨 Start the Frontend

From the client directory:

npm run dev

Then open the local URL provided by Vite.

🧪 Using ScrapeSense

1️⃣ 🔗 Enter a Product URL

Open ScrapeSense and paste an Amazon product URL.

2️⃣ 🚀 Start the Analysis

Start the product analysis.

3️⃣ 🕷️ Scrape Product Data

Bright Data retrieves the available product information.

4️⃣ 📦 Process Structured Data

The backend receives and processes the scraped data.

5️⃣ 🤖 Analyze with AI

The product information is sent to the AI layer.

6️⃣ 📊 View Product Intelligence

Review the resulting information and AI-generated insights in the dashboard.

🧠 What I Learned

Building ScrapeSense helped me understand how different parts of a real-world application work together.

📚 Key areas explored:

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

🕷️ Web Data Extraction → ⚙️ Backend Processing → 🤖 AI Analysis → 📊 Frontend Visualization

into one working application.

🔮 Future Improvements

Some ideas for future versions:

🔄 Multi-product comparison

📈 Historical price tracking

🧠 Deeper review sentiment analysis

🛒 Support for additional e-commerce platforms

🎯 Personalized product recommendations

📊 Product trend analysis

🧾 More detailed review intelligence

🎥 Demo

A short demo should show:

🔗 Amazon URL
      ↓
🕷️ Bright Data Scraping
      ↓
📦 Structured Product Data
      ↓
🤖 AI Analysis
      ↓
📊 ScrapeSense Dashboard

🎬 Demo: ADD_DEMO_LINK_HERE

🏆 Built for Scrape-Verse

🚀 ScrapeSense was built for the Scrape-Verse Hackathon by WeMakeDevs, using Bright Data for web data extraction.

🙌 Special Thanks

🕷️ Bright Data
For providing powerful web data extraction capabilities.

👨‍💻 WeMakeDevs
For organizing the Scrape-Verse hackathon and creating the opportunity to build with web data.

👨‍💻 Author

Yatish G K

Built with:

💡 Curiosity
🧠 Learning
💻 Code
🐛 Debugging
🚀 Experimentation

<p align="center">

🕷️ Scrape Smart. 🤖 Analyze Smarter. 📊 Decide Better. 🚀

</p>

<p align="center">
🏆 Built for <b>Scrape-Verse</b> &nbsp; • &nbsp;
🕷️ Powered by <b>Bright Data</b> &nbsp; • &nbsp;
👨‍💻 Organized by <b>WeMakeDevs</b>
</p>