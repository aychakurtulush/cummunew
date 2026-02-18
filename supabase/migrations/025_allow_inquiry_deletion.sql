-- 025_allow_inquiry_deletion.sql

-- 5. Studio Owners can delete inquiries for their studios
CREATE POLICY "Owners can delete inquiries"
ON studio_inquiries FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM studios
        WHERE studios.id = studio_inquiries.studio_id
        AND studios.owner_user_id = auth.uid()
    )
);
