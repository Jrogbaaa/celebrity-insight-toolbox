
import { supabase } from "@/integrations/supabase/client";
import { scrapeInstagramProfile } from "./InstagramScrapingService";

export class InstagramService {
  static async getInstagramProfile(username: string) {
    try {
      // Validate username parameter
      if (!username) {
        throw new Error('Username is required');
      }
      
      // Call the Instagram scraping service
      const profileData = await scrapeInstagramProfile(username);
      return profileData;
    } catch (error) {
      console.error('Error getting Instagram profile:', error);
      throw error;
    }
  }
  
  static async getInstagramAuth() {
    try {
      // Get the Instagram client ID from the edge function
      const { data, error } = await supabase.functions.invoke('get-instagram-client-id');
      
      if (error) {
        throw new Error('Failed to get Instagram client ID');
      }
      
      return data;
    } catch (error) {
      console.error('Error getting Instagram auth:', error);
      throw error;
    }
  }
}
