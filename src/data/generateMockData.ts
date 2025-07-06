import { SurveyData, LearningStyle, ShapedBy, PeakPerformance, Motivation } from '../types/survey';

const locations = [
  'Minneapolis', 'Galway', 'Dublin', 'Shanghai', 'Tokyo', 'Singapore',
  'Tempe', 'Santa Rosa', 'Boulder', 'Memphis', 'Hangzhou', 'Seoul'
];

const firstNames = [
  // Western names
  'James', 'Sarah', 'Michael', 'Emma', 'David', 'Olivia', 'John', 'Sophia',
  'Robert', 'Isabella', 'William', 'Mia', 'Richard', 'Charlotte', 'Joseph',
  // Asian names
  'Wei', 'Yuki', 'Mei', 'Takeshi', 'Priya', 'Raj', 'Anika', 'Sung',
  // European names
  'Soren', 'Elena', 'Liam', 'Fatima', 'Carlos', 'Zara', 'Mateo', 'Nina'
];

const learningStyles: LearningStyle[] = [
  'Visual',
  'Auditory',
  'Reading/Writing',
  'Kinesthetic (Doing)',
  'Interactive/Collaborative'
];

const shapedByOptions: ShapedBy[] = [
  'Education or School Environment',
  'Personal Challenges or Adversity',
  'Travel or Exposure to Different Cultures',
  'Family Traditions',
  'Religion or Spiritual Practices',
  'Community or Neighbors',
  'Sports or the Arts'
];

const peakPerformanceOptions: PeakPerformance[] = [
  'Introvert, Morning',
  'Extrovert, Morning',
  'Ambivert, Morning',
  'Introvert, Night',
  'Extrovert, Evening',
  'Ambivert, Night'
];

const motivationOptions: Motivation[] = [
  'Learning and growth',
  'Making a difference',
  'Building strong relationships',
  'Finding balance or peace',
  'Leading or mentoring others',
  'Exploring new possibilities',
  'Achieving personal goals'
];

const uniqueQualities = [
  "My background in both healthcare and engineering allows me to bridge communication gaps between clinical and technical teams.",
  "Having lived in multiple countries, I naturally connect with diverse perspectives and find common ground when teams face cultural barriers.",
  "I'm known for my ability to remain calm and clear-headed during high-pressure situations, which has been particularly valuable during critical product launches.",
  "My multicultural upbringing has given me a unique lens for problem-solving that combines analytical precision with empathetic understanding of user needs.",
  "Despite my long tenure, I maintain a beginner's mindset that allows me to constantly question assumptions and find innovative approaches to longstanding challenges.",
  "My experience as a competitive athlete taught me how to rapidly adapt to changing circumstances and thrive under pressure, skills I bring to every project.",
  "I have a rare combination of technical expertise and communication skills that allows me to translate complex regulatory requirements into actionable engineering guidelines.",
  "Having been a patient who used a Medtronic device before joining the company, I bring genuine empathy and firsthand experience to our patient-centered design discussions.",
  "I excel at seeing connections between seemingly unrelated fields, which has led to several cross-functional innovations that merged technologies from different business units.",
  "My dual background in materials science and medicine gives me unique insights when troubleshooting biocompatibility issues in product development.",
  "I've developed a talent for spotting hidden talent in teams and creating opportunities for people to shine in ways they didn't know they could.",
  "I bring a unique combination of clinical nursing experience and software development skills that helps me create more intuitive user interfaces for our medical devices.",
  "My experience working across three different industries before healthcare gives me fresh perspectives on challenges that others might see as insurmountable due to industry traditions.",
  "I have an unusual ability to take complex scientific concepts and translate them into accessible language for diverse audiences, from regulators to sales teams.",
  "My synesthetic perception allows me to visualize data relationships in unique ways, often finding correlations in research data that standard analysis might miss."
];

function generateMockData(): SurveyData {
  const medtronic_data = Array.from({ length: 300 }, (_, index) => {
    const id = `user_${String(index + 1).padStart(3, '0')}`;
    const timestamp = new Date(2025, 6, 8, 9 + Math.floor(index / 20), (index % 20) * 3).toISOString();
    const location = locations[Math.floor(Math.random() * locations.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const isAnonymous = Math.random() < 0.1; // 10% chance of being anonymous
    const yearsAtMedtronic = Math.floor(Math.random() * 25); // 0-24 years

    return {
      id,
      timestamp,
      first_name: firstName,
      last_name: isAnonymous ? null : `${location}${Math.floor(Math.random() * 1000)}`,
      is_anonymous: isAnonymous,
      location,
      responses: {
        years_at_medtronic: yearsAtMedtronic,
        learning_style: learningStyles[Math.floor(Math.random() * learningStyles.length)],
        shaped_by: shapedByOptions[Math.floor(Math.random() * shapedByOptions.length)],
        peak_performance: peakPerformanceOptions[Math.floor(Math.random() * peakPerformanceOptions.length)],
        motivation: motivationOptions[Math.floor(Math.random() * motivationOptions.length)],
        unique_quality: uniqueQualities[Math.floor(Math.random() * uniqueQualities.length)]
      }
    };
  });

  return { medtronic_data };
}

// Generate and export the mock data
export const mockSurveyResponses: SurveyData = generateMockData(); 