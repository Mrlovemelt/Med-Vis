# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Medtronic WE Summit Interactive Data Visualization project - a Next.js application that collects attendee survey responses and displays them in real-time visualizations for the "WE: Include, Inspire, Innovate" conference. The system features a mobile survey interface, real-time data visualization, and an admin panel for content moderation.

## Development Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint linting

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Styling**: Tailwind CSS + custom Medtronic branding
- **Visualization**: D3.js for 2D charts, Three.js for 3D constellation views
- **State Management**: React Context + Zustand stores
- **Authentication**: Supabase Auth

### Key Application Flow
1. **Survey Collection**: Multi-step form (`/src/components/SurveyForm/`) collects 5 categorical questions + 1 open-ended question
2. **Data Processing**: Responses stored in Supabase with moderation workflow for open-ended content
3. **Visualization**: Real-time constellation/network visualizations showing connections between attendees
4. **Admin Panel**: Content moderation interface for reviewing open-ended responses

### Database Schema
- `attendees` - Basic attendee information (name, email, anonymous flag)
- `survey_responses` - Survey answers with foreign key to attendees
- `moderation` - Moderation workflow for open-ended responses
- `peak_performance_definitions` - Lookup table for performance types

Key enum types: `learning_style`, `shaped_by`, `peak_performance_type`, `motivation_type`, `moderation_status`

## Important File Locations

### Core Application Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/app/api/survey/route.ts` - Main survey submission endpoint
- `src/app/visualization/page.tsx` - Main visualization display page
- `src/app/admin/page.tsx` - Admin moderation interface

### Component Architecture
- `src/components/SurveyForm/` - Multi-step survey form with individual step components
- `src/components/DataVisualization/` - Visualization components (D3.js charts, Three.js 3D views)
- `src/components/AdminPanel/` - Admin interface for content moderation
- `src/components/shared/` - Reusable UI components

### Data Layer
- `src/lib/supabase/` - Database client, types, and query functions
- `src/lib/context/AppContext.tsx` - Global app state management
- `src/store/` - Zustand stores for visualization state
- `src/types/` - TypeScript type definitions

## Environment Setup

Required environment variables (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Key Features to Understand

### Survey Questions Structure
1. **Years at Medtronic** (determines visual string color) - Integer ranges (<3, 3-5, 5-10, 10-20, 20+)
2. **Learning Style** - Visual, Auditory, Reading/Writing, Kinesthetic, Interactive/Collaborative
3. **Shaped By** - Family, Community, Religion, Education, Sports/Arts, Challenges, Travel/Culture
4. **Peak Performance** - Personality type × time preference (Introvert/Extrovert/Ambivert + Morning/Evening)
5. **Motivation** - Making difference, Personal goals, Learning, Relationships, Leading, Balance, Exploring
6. **Unique Quality** - Open-ended text requiring moderation

### Visualization Concepts
- **Connected Constellations**: Nodes represent attendees, connections show shared responses
- **Color Coding**: Based on years at Medtronic (Q1)
- **Dynamic Filtering**: Can highlight different question dimensions
- **Real-time Updates**: New submissions appear with animations

### Content Moderation Workflow
- Open-ended responses start with `pending` status
- Admin can approve/reject content via admin panel
- Only approved content appears in visualizations
- Moderation history tracked in database

## Project Constraints

- **Event Context**: Built for specific July 2025 Medtronic WE Summit conference
- **Attendee Scale**: Designed for ~600 attendees over 2 days
- **Display Requirements**: Must work on LED wall (16:9 ratio) and ballroom presentations
- **Branding**: Follows Medtronic brand guidelines (see `/public/branding/` and `/src/branding/`)
- **Accessibility**: Mobile-first design for survey completion via QR codes

## Testing Data

- `sample-survey-data.json` - Sample survey responses for development
- `generate_mock_data.py` - Python script for generating test data
- `src/data/mockSurveyResponses3.json` - Mock data for testing visualizations

## Important Notes

- The project uses Supabase Row Level Security (RLS) policies for data access control
- Three.js integration requires client-side rendering - use `'use client'` directive
- Database migrations are in `supabase/migrations/` directory
- Custom fonts (Avenir Next World) are loaded from `/public/branding/coll-avenir-next-world-font/`