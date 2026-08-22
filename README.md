ScrapeSense

AI-Powered Product Intelligence from Web Data

ScrapeSense is a web application that turns an Amazon product URL into easy-to-understand product intelligence.

Instead of manually opening a product page, checking the price, rating, reviews, and other details, a user can provide the product URL and let ScrapeSense collect the product data and generate an AI-assisted analysis.

The project was built for the Scrape-Verse Hackathon by WeMakeDevs, using Bright Data for web data extraction.

What problem does ScrapeSense solve?

Online product research can take time. A shopper may need to:

open product pages

find important product information

compare details

read through reviews

understand the strengths and weaknesses of a product

decide whether the product is worth considering

ScrapeSense brings these steps into one simple workflow.

How ScrapeSense works

The user enters an Amazon product URL.

The React frontend sends the request to the Node.js/Express backend.

The backend uses the Bright Data Amazon product scraper to collect product information.

The scraped data is processed into structured product information.

The structured information is passed to the AI analysis layer.

The analysis is returned to the frontend.

ScrapeSense presents the result as product intelligence that is easier to understand.

Workflow

flowchart LR
    A[Amazon Product URL] --> B[React + Vite Frontend]
    B --> C[Node.js + Express Backend]
    C --> D[Bright Data Amazon Product Scraper]
    D --> E[Structured Product Data]
    E --> F[AI Analysis via Groq]
    F --> G[Product Intelligence]
    G --> H[ScrapeSense Dashboard]

Bright Data integration

Bright Data is a core part of ScrapeSense.

The application uses Bright Data's Amazon product scraping capability to retrieve product information from the supplied product URL. This allows the application to work with current web product data instead of relying on manually entered information.

Data flow

Amazon Product URL
        ↓
ScrapeSense Backend
        ↓
Bright Data
Amazon Product Scraper
        ↓
Structured Product Data
        ↓
AI Analysis
        ↓
Product Intelligence
        ↓
User

AI analysis

After the product data is collected, ScrapeSense sends the relevant information to the AI analysis layer.

The goal is not simply to display raw scraped data, but to turn it into useful information that a user can understand quickly.

The application can present information such as:

product details

price information

rating and review information

product summary

strengths and weaknesses

buying-oriented insights

The AI layer is powered through Groq's API.

Features

Amazon product URL analysis

Bright Data-powered product data extraction

Structured product information

AI-assisted product analysis

Product intelligence dashboard

Price display in INR (₹)

Loading and error handling

React/Vite frontend

Node.js/Express backend

Tech Stack

Frontend

React

Vite

Tailwind CSS

JavaScript

Backend

Node.js

Express.js

REST API

Data extraction

Bright Data

Amazon product scraping

AI

Groq API

OpenAI-compatible chat completions API

Development & deployment

Git

GitHub

Vercel / backend hosting as configured for deployment

Project Structure

ScrapeSense/
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── server/
│   ├── ...
│   └── package.json
│
├── scraper-output/
│   └── sample-product.json
│
├── README.md
└── .gitignore

Setup Instructions

Prerequisites

Install:

Node.js

npm

Git

1. Clone the repository

git clone YOUR_GITHUB_REPOSITORY_URL
cd bright-data-hackathon

2. Install frontend dependencies

cd client
npm install

3. Install backend dependencies

Open another terminal and run:

cd server
npm install

4. Configure environment variables

Create the environment file required by the backend and add your API credentials.

Example:

BRIGHTDATA_API_KEY=your_bright_data_api_key
GROQ_API_KEY=your_groq_api_key

Use the exact variable names already present in the project's backend configuration.

Never commit real API keys to GitHub.

5. Start the backend

From the server directory, run the development command defined in server/package.json.

For example:

npm run dev

6. Start the frontend

From the client directory:

npm run dev

Open the local URL shown by Vite in your browser.

Using ScrapeSense

Open ScrapeSense.

Enter an Amazon product URL.

Start the analysis.

Wait for Bright Data to retrieve the product information.

Review the structured product information and AI-generated insights.

Structured Scraper Studio Output

The scraper-output/ directory is included for the structured output produced by the Bright Data Scraper Studio workflow.

Before final submission, replace the sample file in that directory with an actual JSON export/output from your Scraper Studio scraper so the repository demonstrates the exact structured data used by the project.

Demo

A short demo should show:

Opening ScrapeSense.

Entering an Amazon product URL.

Starting the analysis.

Product data being retrieved.

AI-generated product intelligence appearing in the dashboard.

Add the final demo link here:

Demo: ADD_DEMO_LINK_HERE

Why this project?

ScrapeSense explores how web data extraction and AI can work together.

The project combines:

Web data → structured information → AI analysis → useful product intelligence

This makes raw product data easier for a person to understand and use.

Future Improvements

Possible future improvements include:

multi-product comparison

historical price tracking

deeper review sentiment analysis

more e-commerce sources

personalized recommendations

product trend detection

improved AI explanations

Hackathon

Built for the Scrape-Verse Hackathon by WeMakeDevs, using Bright Data.

Special thanks to WeMakeDevs and Bright Data for providing the opportunity and tools to build with web data.

Credits

Bright Data — web data extraction

WeMakeDevs — Scrape-Verse Hackathon

Groq — AI inference API

Author

Built by Yatish as a hackathon project.