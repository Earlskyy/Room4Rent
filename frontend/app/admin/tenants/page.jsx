'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { tenantAPI, roomAPI } from '@/lib/services';
import AdminLayout from '@/components/AdminLayout';

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/auth/login');
      return;
    }
    fetchTenants();
    fetchRooms();
  }, [router]);

  const fetchTenants = async () => {
    try {
      const response = await tenantAPI.getTenants();
      setTenants(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await roomAPI.getRooms();
      setRooms(response.data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

  const handleRemoveTenant = async (id) => {
    if (window.confirm('Are you sure you want to remove this tenant?')) {
      try {
        await tenantAPI.removeTenant(id);
        fetchTenants();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to remove tenant');
      }
    }
  };

  if (loading) return <AdminLayout><div className="text-center py-10">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Manage Tenants</h1>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            + Add Tenant
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
                <th className="px-6 py-3 text-left font-semibold text-white">Name</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Email</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Room</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Occupants</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Contact</th>
                <th className="px-6 py-3 text-left font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                  <td className="px-6 py-3 text-white">{tenant.name}</td>
                  <td className="px-6 py-3 text-white">{tenant.email}</td>
                  <td className="px-6 py-3 text-white">{tenant.room_name}</td>
                  <td className="px-6 py-3 text-white">{tenant.number_of_occupants}</td>
                  <td className="px-6 py-3 text-white">{tenant.contact_number}</td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleRemoveTenant(tenant.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <TenantModal
            rooms={rooms}
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              fetchTenants();
              setShowModal(false);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function TenantModal({ rooms, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    room_id: '',
    contact_number: '',
    number_of_occupants: '1',
    move_in_date: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Generate random password if not provided
  const generatePassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const submitData = {
        ...formData,
        room_id: parseInt(formData.room_id),
        number_of_occupants: parseInt(formData.number_of_occupants),
        password: formData.password || generatePassword(),
      };

      await tenantAPI.createTenant(submitData);
      
      // Show success with credentials
      setSuccessMessage(`
        ✓ Tenant created successfully!
        Email: ${submitData.email}
        Password: ${submitData.password}
        
        Share these credentials with the tenant.
      `);
      
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tenant');
    }
  };

  if (successMessage) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h2 className="text-xl font-bold mb-4">Success!</h2>
            <div className="bg-gray-100 p-4 rounded-lg text-left text-sm font-mono mb-4">
              <p className="mb-2">Email: <strong>{formData.email}</strong></p>
              <p>Password: <strong>{formData.password}</strong></p>
            </div>
            <p className="text-gray-600 mb-6">Share these credentials with the tenant.</p>
            <button type="button" onClick={onSuccess} className="btn-primary w-full">
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold">Add Tenant</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              placeholder="tenant@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password (leave empty to auto-generate)</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field"
              placeholder="• • • • • • • •"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Room *</label>
            <select
              value={formData.room_id}
              onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select a room</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.room_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Number</label>
            <input
              type="text"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              className="input-field"
              placeholder="09123456789"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Number of Occupants</label>
            <input
              type="number"
              value={formData.number_of_occupants}
              onChange={(e) => setFormData({ ...formData, number_of_occupants: e.target.value })}
              className="input-field"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Move In Date *</label>
            <input
              type="date"
              value={formData.move_in_date}
              onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="flex gap-4">
            <button type="submit" className="btn-primary flex-1">
              Add Tenant
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
