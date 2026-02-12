export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  enable_push: boolean;
  enable_sms: boolean;
  enable_email: boolean;
}
