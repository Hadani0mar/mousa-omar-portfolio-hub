
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProjectStats {
  id: string;
  download_count: number;
  like_count: number;
  user_liked: boolean;
  download_enabled: boolean;
}

export const useProjectInteractions = (projectId: string) => {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  const getDeviceFingerprint = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).slice(0, 32);
  }, []);

  const loadStats = useCallback(async () => {
    try {
      // Load project download settings
      const { data: projectData } = await supabase
        .from('projects')
        .select('download_enabled, download_count, like_count')
        .eq('id', projectId)
        .single();

      if (!projectData) return;

      // Check if user already liked this project
      const deviceId = getDeviceFingerprint();
      const { data: likeData } = await supabase
        .from('project_likes')
        .select('id')
        .eq('project_id', projectId)
        .eq('device_id', deviceId)
        .maybeSingle();

      setStats({
        id: projectId,
        download_count: projectData.download_count || 0,
        like_count: projectData.like_count || 0,
        user_liked: !!likeData,
        download_enabled: projectData.download_enabled ?? true
      });
    } catch (error) {
      console.error('Error loading project stats:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, getDeviceFingerprint]);

  const handleDownload = useCallback(async () => {
    try {
      await supabase.rpc('increment_download_count', { project_id: projectId });
      setStats(prev => prev ? { ...prev, download_count: prev.download_count + 1 } : null);
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  }, [projectId]);

  const handleLike = useCallback(async () => {
    if (!stats || stats.user_liked) return;

    try {
      const deviceId = getDeviceFingerprint();
      
      // Add like record
      const { error: likeError } = await supabase
        .from('project_likes')
        .insert({
          project_id: projectId,
          device_id: deviceId,
          ip_address: '' // Will be handled by RLS if needed
        });

      if (likeError) throw likeError;

      // Increment like count
      await supabase.rpc('increment_like_count', { project_id: projectId });
      
      setStats(prev => prev ? { 
        ...prev, 
        like_count: prev.like_count + 1,
        user_liked: true 
      } : null);
    } catch (error) {
      console.error('Error adding like:', error);
    }
  }, [projectId, stats, getDeviceFingerprint]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    handleDownload,
    handleLike,
    refreshStats: loadStats
  };
};
