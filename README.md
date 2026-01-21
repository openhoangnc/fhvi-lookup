# FHVI Lookup

A modern, responsive hospital lookup application built with React and TypeScript. Search and filter through healthcare providers in the FHVI network with ease.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)

## ✨ Features

- **🔍 Smart Search** - Search hospitals by name, address, phone number, or services
- **📍 Location Filtering** - Filter by country, city, and district with hierarchical selection
- **🏥 Category & Service Filters** - Filter by hospital category and available services
- **⏰ Working Hours Filter** - Find hospitals open on specific days and hours
- **🌓 Dark/Light Theme** - Toggle between dark and light modes
- **📱 Responsive Design** - Mobile-friendly, macOS/iOS-style interface
- **🗺️ Map Integration** - View hospital locations on map
- **📞 Quick Actions** - One-tap calling and directions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd fhvi-lookup

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
fhvi-lookup/
├── src/
│   ├── components/        # React components
│   │   └── HospitalCard.tsx
│   ├── data/              # JSON data files
│   │   └── fhvi.json
│   ├── types/             # TypeScript type definitions
│   │   └── hospital.ts
│   ├── utils/             # Utility functions
│   │   ├── filter.ts      # Search and filter logic
│   │   └── translations.ts
│   ├── App.tsx            # Main application component
│   ├── App.css            # Application styles
│   └── index.css          # Global styles
├── public/                # Static assets
└── index.html             # HTML entry point
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🏥 Data Structure

The application uses hospital data with the following key fields:

- **Basic Info**: name, engName, category, providerType
- **Contact**: phoneNumber[], website
- **Location**: address, city, district, country, geo coordinates
- **Services**: services[], appliedBenefitServiceDetails[]
- **Schedule**: workHours[] with operation hours and days
- **Network**: isSTP, fHVINetwork, preferredClinic

## 🎨 Features in Detail

### Search
Full-text search across multiple fields including:
- Hospital names (Vietnamese and English)
- Addresses
- Phone numbers (smart numeric matching)
- Available services

### Filtering
Hierarchical location filtering:
1. Select Country → Available cities update
2. Select City → Available districts update
3. Filter by category, service, or working hours

### Theme Support
- Default light theme
- Dark mode toggle
- Persistent theme preference

## 🛠️ Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Styling**: CSS with CSS Variables

## 📄 License

Private project.
