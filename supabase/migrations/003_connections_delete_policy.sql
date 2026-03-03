-- Allow the client who created a pending connection to delete it
CREATE POLICY "Client can delete own pending connections"
  ON connections
  FOR DELETE
  USING (
    client_id = auth.uid()
    AND status = 'pending'
  );
