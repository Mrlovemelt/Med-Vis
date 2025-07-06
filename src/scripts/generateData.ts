import * as fs from 'fs';
import * as path from 'path';

type LearningStyle = 
  | 'Visual'
  | 'Auditory'
  | 'Reading/Writing'
  | 'Kinesthetic (Doing)'
  | 'Interactive/Collaborative';

type ShapedBy = 
  | 'Education or School Environment'
  | 'Personal Challenges or Adversity'
  | 'Travel or Exposure to Different Cultures'
  | 'Family Traditions'
  | 'Religion or Spiritual Practices'
  | 'Community or Neighbors'
  | 'Sports or the Arts';

type PeakPerformance = 
  | 'Introvert, Morning'
  | 'Extrovert, Morning'
  | 'Ambivert, Morning'
  | 'Introvert, Night'
  | 'Extrovert, Evening'
  | 'Ambivert, Night';

type Motivation = 
  | 'Learning and growth'
  | 'Making a difference'
  | 'Building strong relationships'
  | 'Finding balance or peace'
  | 'Leading or mentoring others'
  | 'Exploring new possibilities'
  | 'Achieving personal goals';

interface SurveyResponse {
  id: string;
  timestamp: string;
  first_name: string;
  last_name: string | null;
  is_anonymous: boolean;
  location: string;
  responses: {
    years_at_medtronic: number;
    learning_style: LearningStyle;
    shaped_by: ShapedBy;
    peak_performance: PeakPerformance;
    motivation: Motivation;
    unique_quality: string;
  };
}

interface SurveyData {
  medtronic_data: SurveyResponse[];
}

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

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateMockData(): SurveyData {
  const medtronic_data: SurveyResponse[] = Array.from({ length: 300 }, (_, index) => {
    const id = `user_${String(index + 1).padStart(3, '0')}`;
    const baseDate = new Date('2025-07-08T09:00:00Z');
    const timestamp = new Date(baseDate.getTime() + index * 3 * 60000).toISOString();
    const location = getRandomElement(locations);
    const firstName = getRandomElement(firstNames);
    const isAnonymous = Math.random() < 0.1; // 10% chance of being anonymous

    return {
      id,
      timestamp,
      first_name: firstName,
      last_name: isAnonymous ? null : `${location}${Math.floor(Math.random() * 1000)}`,
      is_anonymous: isAnonymous,
      location,
      responses: {
        years_at_medtronic: Math.floor(Math.random() * 25),
        learning_style: getRandomElement(learningStyles),
        shaped_by: getRandomElement(shapedByOptions),
        peak_performance: getRandomElement(peakPerformanceOptions),
        motivation: getRandomElement(motivationOptions),
        unique_quality: getRandomElement(uniqueQualities)
      }
    };
  });

  return { medtronic_data };
}

const mockData = generateMockData();
fs.writeFileSync(
  path.join(__dirname, '../data/mockSurveyResponses3.json'),
  JSON.stringify(mockData, null, 2)
);

console.log('Generated 300 mock entries in src/data/mockSurveyResponses3.json'); 