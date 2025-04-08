
# PHISHERMAN CHROME EXTENSION

A real-time phishing detection system integrated into a Chrome Extension, backed by a powerful **Node.js + Express API**, a **Python Flask ML microservice**, and a **MongoDB database** for storing and updating phishing URLs dynamically. The system uses an **ensemble machine learning model** to evaluate the likelihood of phishing based on 20+ URL features. A React + TypeScript web interface is also included for monitoring, all deployed via the **Render Cloud Platform**.

## Chrome Extension
<p align="center">
  <img src="https://github.com/user-attachments/assets/85a353e0-5371-4434-86a5-6a166dba9921" alt="Phisherman Chrome Extension" height="400"/>
</p>

## Our Website

<p align="center">
  <img src="https://github.com/user-attachments/assets/83d73600-9e20-4c7b-8ed7-2b54ea39a4e5" alt="Phisherman Website" width="600"/>
</p>

Click here: [Phisherman](https://phisherman-extension.onrender.com/)
---

## 🚀 Features

- 🧠 **Machine Learning-Driven Detection**  
  Ensemble model (Random Forest, XGBoost, Logistic Regression) predicts phishing likelihood.

- 🌐 **Real-Time Chrome Extension**  
  Instantly scans websites visited by the user and alerts on phishing attempts.

- 🔍 **Feature-Rich Analysis**  
  Extracts and analyzes 20+ features:
  - URL length, subdomains, IP address usage
  - Domain age (WHOIS)
  - Shortening services
  - Redirection behavior

- 🗃️ **MongoDB Integration**  
  Stores flagged phishing URLs in real-time for future analysis and system learning.

- 📊 **Admin Dashboard (React + TypeScript)**  
  A web interface to check URL manually and report URL's which might be missed.

- ☁️ **Render Cloud Deployment**  
  All backend services and dashboard are deployed on [Phisherman](https://phisherman-extension.onrender.com/)

---

## 🧠 Tech Stack

### Chrome Extension
- Manifest v3
- JavaScript + DOM scripting
- Secure background scripts with API integration

### Backend
- **Node.js + Express.js**: Handles Chrome Extension API requests, MongoDB operations
- **Python + Flask**: ML microservice to compute phishing likelihood
- **MongoDB**: Stores phishing URLs
  
### Machine Learning
- Ensemble model trained on phishing/malicious URL datasets
- Feature extraction pipeline:
  - Structural (URL length, special chars)
  - Domain-based (WHOIS, age)
  - Behavioral (redirects, IP usage)

### Frontend Dashboard
- **React.js + TypeScript**: User Landing Page
- **Tailwind CSS**: Styling

### Deployment
- Deployed on **Render Cloud Platform**

---

## 📄 License

This project is **not open for commercial use**.  
See the [LICENSE](License) file for details.  
All rights reserved © 2025 Dhanyashree M



