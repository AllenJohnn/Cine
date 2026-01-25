-- Fix the notifications insert policy to be more secure
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Only allow authenticated users to create notifications (for system use via triggers/functions)
CREATE POLICY "Authenticated can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);