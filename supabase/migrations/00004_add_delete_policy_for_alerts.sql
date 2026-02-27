-- Add DELETE policy for police to delete alerts
CREATE POLICY "Police can delete alerts" ON alerts
  FOR DELETE TO authenticated
  USING (is_police(auth.uid()));