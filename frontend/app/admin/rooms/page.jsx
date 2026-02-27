'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { roomAPI } from '@/lib/services';
import AdminLayout from '@/components/AdminLayout';

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    room_name: '',
    base_rent: '',
  });

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/auth/login');
      return;
    }
    fetchRooms();
  }, [router]);

  const fetchRooms = async () => {
    try {
      const response = await roomAPI.getRooms();
      setRooms(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await roomAPI.createRoom({
        ...formData,
        base_rent: parseFloat(formData.base_rent),
      });
      setFormData({ room_name: '', base_rent: '' });
      setShowModal(false);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await roomAPI.deleteRoom(id);
        fetchRooms();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete room');
      }
    }
  };

  if (loading) return <AdminLayout><div className="text-center py-10">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Manage Rooms</h1>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            + Add Room
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700 border-b border-slate-600">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-white">Room Name</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Base Rent</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                  <td className="px-6 py-3 text-white">{room.room_name}</td>
                  <td className="px-6 py-3 text-white">₱{room.base_rent}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        room.status === 'occupied'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {room.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <h2 className="text-2xl font-bold">Add New Room</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Room Name</label>
                <input
                  type="text"
                  value={formData.room_name}
                  onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Base Rent (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.base_rent}
                  onChange={(e) => setFormData({ ...formData, base_rent: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1">
                  Create Room
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
}
