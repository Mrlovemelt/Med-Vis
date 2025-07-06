# Medtronic WE Summit Visualization

An interactive visualization system for the Medtronic WE Summit, built with Next.js, TypeScript, and Three.js.

## Features

- Multi-step survey form for collecting attendee responses
- Real-time data visualization using Three.js
- Admin panel for response moderation
- Data export functionality
- Mobile-friendly design

## Tech Stack

- Frontend: Next.js 14 with App Router and TypeScript
- Styling: Tailwind CSS
- Database: Supabase with PostgreSQL
- State Management: React Context + SWR
- Visualization: Three.js
- Deployment: Vercel

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd medtronic-we-summit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Initialize the database:
   - Create a new Supabase project
   - Run the SQL scripts in `supabase/migrations/20240320000000_initial_schema.sql`

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── form/           # Survey form components
│   ├── visualization/  # Data visualization components
│   ├── admin/          # Admin panel components
│   └── layout/         # Layout components
├── lib/                # Utility functions and configurations
│   ├── supabase/       # Supabase client and types
│   ├── context/        # React Context providers
│   └── utils/          # Helper functions
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Deployment

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Configure environment variables in Vercel
4. Deploy

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited. 