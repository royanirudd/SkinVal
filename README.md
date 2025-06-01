# SkinVal
# 🌿 SkinVal – AI-Powered Skin Analysis & Product Recommendation

SkinVal is a skincare product recommending website that provides skin condition detection, and personalized product recommendations. The platform blends advanced web scraping, Retrieval-Augmented Generation (RAG) to create a truly intelligent skincare experience.

---

## ✨ Features

- 📸 **User interface** - Dynamic and user-friendly
- 🤖 **Chat-based Skin Assistant** powered by AI model
- 🔍 **Dynamic Web Scraping** of skincare product details from real-time web sources
- 🛍️ **AI-Powered Product Recommendation Engine** using RAG
- 🔐 **User Authentication** via Firebase
- 🎨 **Modern Frontend Interface** with smooth interactions and animations
- **TensorFlow.js** and **BlazeFace** for skin detection
- **Dev Tools**: `dotenv` ,`winston`

---

### 🔍 1. Retrieval-Augmented Generation (RAG)

SkinVal implements a Retrieval-Augmented Generation pipeline:

- **Retrieve**: Scrapes real-time skincare product data from external websites.
- **Augment**: Merges user preferences, skin data, and retrieved info into a structured prompt.
---

### 🌐 2. Web Scraping Engine

- Uses `axios` and `cheerio` to fetch product data like price, description, ingredients, and reviews from websites.
- Integrates `random-useragent` and `user-agents` to rotate headers and mimic real browser behavior, avoiding bans.
- Parsed data is used in AI prompts for product suggestions and shown in the UI.

---

### 📸 3. Facial Skin Analysis

- Uses `@tensorflow-models/blazeface` to detect facial landmarks and assess:
  - Skin tone
  - Acne/pigmentation
  - Facial symmetry
- Analysis is visual and processed via webcam or uploaded image.

---

## 🧪 Tech Stack

| Layer         | Tools Used                                                      |
|---------------|-----------------------------------------------------------------|
| Frontend      | HTML5, CSS3, React.Js, SVG                                      |
| Backend       | Node.js, Express.js, REST APIs                                  |
| ML/Detection  | TensorFlow.js, BlazeFace                                        |
| Data Retrieval| Cheerio, Axios                                                  |
| Database      | Firebase (User Auth & Data)                                     |
| Authentication| Session-based, Secure Login via Express                         |


---
## 🔧 Implementation Details

### 🔐 Authentication (`auth.js`)
- Custom login form handled in `login.html`
- User credentials validated in `auth.js`
- Secure session management using:
  - Cookies
  - Firebase (Realtime Database or Firebase Auth)

---

### 🎯 Skin Analysis (`script.js`, BlazeFace)
- Supports both image upload and live webcam capture
- Facial image analyzed using **TensorFlow BlazeFace** via `@tensorflow/tfjs-node`
- Detects:
  - Acne
  - Pigmentation etc
- Results are tagged and used for product filtering

---

### 🤖 ChatBot (`chat.js`)
- Real-time chat interface with a skin advisor bot
- Backend supports multi-model interaction
- Prompt crafting includes:
  - User skin issues
  - Scraped product details (via RAG)
- Returns:
  - Personalized skincare advice
  - Recommended products
  - Chat-based follow-up queries

---

### 🔍 Product Recommendation Engine (`scrape.js`)
- Web scraping from ecommerce sites using:
  - `axios` for HTTP requests
  - `cheerio` for HTML parsing
- Product metadata extracted:
  - Title
  - Price
  - Ingredients
  - Rating

---

### 🧠 RAG (Retrieval-Augmented Generation)
- Scraped product info forms external "context"
- Enables:
  - Fact-based suggestions
  - Context-aware

---

### 🌐 API Management
- All Express.js routes defined in `server.js`
- APIs follow RESTful conventions
- Static frontend served using Express middleware
- Logs handled using `morgan` and `winston`
- API documentation maintained in `apiDoc.txt`

---

## 📌 API Endpoints (Sample Overview)

| Method | Route         | Description                              |
|--------|---------------|------------------------------------------|
| GET    | `/`           | Loads homepage                           |
| POST   | `/login`      | Authenticates and logs in user           |
| POST   | `/analyze`    | Analyzes uploaded face image             |
| POST   | `/recommend`  | Provides AI-powered product recommendations |



