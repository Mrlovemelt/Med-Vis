-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for categorical fields
CREATE TYPE learning_style AS ENUM ('visual', 'auditory', 'kinesthetic', 'reading_writing');
CREATE TYPE shaped_by AS ENUM ('mentor', 'challenge', 'failure', 'success', 'team', 'other');
CREATE TYPE peak_performance_type AS ENUM ('individual', 'team', 'leadership', 'innovation', 'crisis');
CREATE TYPE motivation_type AS ENUM ('impact', 'growth', 'recognition', 'autonomy', 'purpose');
CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'rejected');

-- Create attendees table
CREATE TABLE attendees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT UNIQUE,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create survey_responses table
CREATE TABLE survey_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    attendee_id UUID REFERENCES attendees(id) ON DELETE CASCADE,
    years_at_medtronic INTEGER CHECK (years_at_medtronic >= 0),
    learning_style learning_style,
    shaped_by shaped_by,
    peak_performance peak_performance_type,
    motivation motivation_type,
    unique_quality TEXT,
    status moderation_status DEFAULT 'pending',
    moderated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create peak_performance_definitions table
CREATE TABLE peak_performance_definitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type peak_performance_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(type, title)
);

-- Create moderation table
CREATE TABLE moderation (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    response_id UUID REFERENCES survey_responses(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL CHECK (field_name IN ('unique_quality')),
    status moderation_status DEFAULT 'pending',
    moderator_id UUID NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(response_id, field_name)
);

-- Create indexes
CREATE INDEX idx_attendees_email ON attendees(email);
CREATE INDEX idx_attendees_created_at ON attendees(created_at);
CREATE INDEX idx_survey_responses_attendee_id ON survey_responses(attendee_id);
CREATE INDEX idx_survey_responses_created_at ON survey_responses(created_at);
CREATE INDEX idx_moderation_response_id ON moderation(response_id);
CREATE INDEX idx_moderation_status ON moderation(status);
CREATE INDEX idx_peak_performance_definitions_type ON peak_performance_definitions(type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_attendees_updated_at
    BEFORE UPDATE ON attendees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_responses_updated_at
    BEFORE UPDATE ON survey_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_moderation_updated_at
    BEFORE UPDATE ON moderation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peak_performance_definitions_updated_at
    BEFORE UPDATE ON peak_performance_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE peak_performance_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Attendees policies
CREATE POLICY "Allow public read access to attendees"
    ON attendees FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to create attendees"
    ON attendees FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Survey responses policies
CREATE POLICY "Allow public read access to survey responses"
    ON survey_responses FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to create survey responses"
    ON survey_responses FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read survey responses"
    ON survey_responses FOR SELECT
    TO authenticated
    USING (true);

-- Peak performance definitions policies
CREATE POLICY "Allow public read access to peak performance definitions"
    ON peak_performance_definitions FOR SELECT
    USING (true);

CREATE POLICY "Allow admin users to manage peak performance definitions"
    ON peak_performance_definitions FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = current_setting('app.settings.admin_email', true)));

-- Moderation policies
CREATE POLICY "Allow moderators to manage moderation"
    ON moderation FOR ALL
    TO authenticated
    USING (auth.uid() = moderator_id)
    WITH CHECK (auth.uid() = moderator_id);

CREATE POLICY "Allow moderators to read moderation"
    ON moderation FOR SELECT
    TO authenticated
    USING (true);

-- Insert initial peak performance definitions
INSERT INTO peak_performance_definitions (type, title, description) VALUES
    ('individual', 'Technical Excellence', 'Demonstrating exceptional technical skills and expertise'),
    ('individual', 'Problem Solving', 'Successfully resolving complex challenges'),
    ('team', 'Collaboration', 'Achieving outstanding results through team effort'),
    ('team', 'Cross-functional Success', 'Delivering results across multiple departments'),
    ('leadership', 'Team Development', 'Successfully growing and developing team members'),
    ('leadership', 'Strategic Vision', 'Implementing successful strategic initiatives'),
    ('innovation', 'Process Improvement', 'Creating significant efficiency improvements'),
    ('innovation', 'Product Development', 'Developing successful new products or features'),
    ('crisis', 'Emergency Response', 'Successfully managing critical situations'),
    ('crisis', 'Change Management', 'Leading successful organizational change'); 