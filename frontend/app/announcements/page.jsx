'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isTenant } from '@/lib/auth';
import { announcementAPI } from '@/lib/services';

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isTenant()) {
      router.push('/auth/login');
      return;
    }

    const fetchAnnouncements = async () => {
      try {
        const response = await announcementAPI.getAnnouncements();
        setAnnouncements(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [router]);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-8">Announcements</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {announcements.length > 0 ? (
          <div className="space-y-6">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="card">
                <h2 className="text-2xl font-bold mb-2">{announcement.title}</h2>
                <p className="text-gray-500 text-sm mb-4">
                  {new Date(announcement.created_at).toLocaleDateString()}
                </p>
                <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-100 rounded-lg">
            <p className="text-gray-600">No announcements yet</p>
          </div>
        )}

        <a href="/tenant" className="btn-secondary mt-8">
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
