# Study Quest

> Transform your study sessions into an epic RPG adventure! Level up your character, unlock achievements, and conquer your academic goals with AI-powered assistance.

[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Overview

**Study Quest** is a full-stack MERN application that gamifies the studying experience by combining productivity tools with RPG mechanics. Students create characters, earn XP through study sessions, unlock achievements, and use AI-powered features to enhance their learning.

### The Vision

Transform mundane study sessions into an engaging adventure where:
- Study sessions award XP and level up your character
- Achievements unlock for reaching milestones
- AI generates personalized quizzes from uploaded study materials
- Daily streaks and challenges keep you motivated
- Earned gold can purchase cosmetic items for customization

---

## Features

### Core Study Features
- **Pomodoro Timer**: Customizable study (1-120 min) and break (1-30 min) sessions
- **Preset Timers**: Quick presets for Pomodoro (25/5), Long (50/10), and Short (15/3)
- **Session Tracking**: Complete history of all study sessions with filtering
- **Subject Management**: Tag sessions with subjects for organized tracking
- **Study Statistics**: Visual charts showing session count, total time, XP earned, and average session length

### RPG Mechanics
- **Character System**: Create custom characters with avatar selection
- **XP & Leveling**: Earn 1 XP per minute studied, level up to increase stats
- **Stats Progression**: Focus, Knowledge, and Discipline stats increase with each level
- **Gold Currency**: Earn gold from study sessions to spend in the shop
- **Level-Up Modals**: Celebratory animations when gaining levels

### Achievement System
Unlock badges for various milestones:
- **First Steps**: Complete your first study session
- **Dedicated Student**: Reach level 5
- **Study Marathon**: Complete 10 study sessions
- **Hour of Power**: Study for 60+ minutes in one session
- **Early Bird**: Complete a morning study session
- **Night Owl**: Complete a late night study session
- **Weekend Warrior**: Study on a weekend
- **Consistency**: Maintain a 7-day study streak

### Streaks & Challenges
- **Daily Streaks**: Track consecutive days of studying
- **Longest Streak**: View your best streak record
- **Daily Challenges**: AI-generated challenges that refresh daily
- **Streak Rewards**: Bonus XP for maintaining streaks

### AI-Powered Learning
- **Quiz Generation**: AI creates custom quizzes from uploaded PDF study materials
- **Difficulty Levels**: Easy, Medium, and Hard quiz options
- **Practice Questions**: Generate unlimited practice questions on any topic
- **Concept Explanations**: Ask AI to explain complex concepts
- **Study Guides**: AI generates comprehensive study guides from materials
- **Smart Prompting**: Optimized prompts ensure relevant, high-quality content

### Shop & Inventory
- **Avatar Shop**: Purchase new character avatars
- **Backgrounds**: Buy decorative backgrounds for your dashboard
- **Titles**: Unlock prestigious titles to display
- **Power-Ups**: Time-limited boosts like XP multipliers
- **Rarity System**: Items categorized as Common, Rare, Epic, and Legendary
- **Inventory Management**: Equip and unequip purchased items
- **Purchase Confirmations**: Clear modals showing cost and effects

### Analytics & Insights
- **Session History**: Searchable list of all completed sessions
- **Time Breakdown**: Visual charts of study time distribution
- **Subject Analysis**: Track which subjects you study most
- **Performance Trends**: See your progress over time
- **Achievement Progress**: Track how close you are to unlocking achievements

---

## Tech Stack

### Frontend
- **React 18.2** - UI library with hooks and functional components
- **Vite** - Fast build tool and dev server
- **React Router 6** - Client-side routing with protected routes
- **Tailwind CSS 3** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Recharts** - Charting library for data visualization
- **Axios** - HTTP client for API requests

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express 4** - Web application framework
- **MongoDB 6** - NoSQL database
- **Mongoose 7** - ODM for MongoDB
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload middleware
- **pdf2json** - PDF text extraction
- **OpenAI API** - AI-powered features (GPT-4)
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Development Tools
- **MongoDB Compass** - Database GUI for testing
- **Thunder Client** - VS Code extension for API testing
- **ESLint** - Code linting for quality
- **Git** - Version control

---

*Built as a full-stack MERN learning project.*
