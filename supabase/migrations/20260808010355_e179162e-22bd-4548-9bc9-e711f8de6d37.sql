CREATE POLICY "Anyone can read vault files" ON storage.objects
FOR SELECT USING (bucket_id IN ('audio','covers'));

CREATE POLICY "Admins can upload vault files" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('audio','covers') AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update vault files" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id IN ('audio','covers') AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete vault files" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id IN ('audio','covers') AND public.has_role(auth.uid(), 'admin'));