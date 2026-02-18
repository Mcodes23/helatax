# HelaTax – AI-Powered Tax Assistant for Kenyan SMEs
## Overview

HelaTax is a backend-driven tax assistance platform designed to help Kenyan SMEs manage tax workflows and generate AI-powered tax insights. The system combines a secure REST API architecture with Python-based AI processing to deliver intelligent tax support.

This project was developed as a final-year capstone and focuses on scalable backend architecture, secure authentication, and integration between Node.js services and AI components.

## Problem Statement

Many Kenyan SMEs struggle with:

- Understanding tax compliance requirements

- Generating accurate tax insights

- Managing financial data securely

HelaTax aims to simplify this through automated backend workflows and AI-assisted tax guidance.

## Tech Stack

### Backend

1. Node.js

2. Express.js

3. RESTful API architecture

4. JWT-based authentication & authorization

### Database

1. MongoDB (Schema design for financial records)

2. Mongoose ODM

### AI Integration

- Python-based tax insight generation scripts

- API integration between Node backend and AI module

### Frontend

- React

System Architecture

Client → REST API (Express) → Authentication (JWT) → MongoDB
                       ↓
                  Python AI Processing Module

## Key Features

1. Secure user registration and authentication (JWT)

2. Role-based access control

3. Tax data storage and management

4. AI-generated personalized tax insights

5. Modular backend architecture

## Engineering Highlights

1. Designed RESTful API following clean routing structure

2. Implemented middleware-based authentication and error handling

3. Structured MongoDB schemas for financial integrity

4. Integrated cross-language communication between Node.js and Python

5. Applied environment variable configuration for secure deployment

## Setup Instructions
```bash
git clone https://github.com/Mcodes23/helatax.git
cd helatax
npm install
```
## Create a .env file:
```bash
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret
```

## Run the server:
```bash
npm start
```

## Future Improvements

- Containerization with Docker

- CI/CD pipeline integration

- Cloud deployment (AWS/GCP)

- Enhanced audit logging and monitoring
