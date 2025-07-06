-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow moderators to manage moderation" ON moderation;

-- Create a more permissive policy for authenticated users
CREATE POLICY "Allow authenticated users to manage moderation"
    ON moderation FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Keep the read policy for all authenticated users
-- (This policy already exists and is fine) 