'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { meterAPI, roomAPI } from '@/lib/services';
import AdminLayout from '@/components/AdminLayout';

export default function FeeManagementPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    room_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    // Electricity fields
    previous_reading: '',
    current_reading: '',
    rate_per_kwh: '',
    // Water fields
    water_number_of_people: '',
    water_fee_per_head: '',
    // Internet fields
    internet_number_of_devices: '',
    internet_fee_per_device: '',
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

  const handleSaveReading = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        room_id: parseInt(formData.room_id),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
      };

      // Electricity data - optional
      if (formData.previous_reading || formData.current_reading) {
        submitData.previous_reading = parseFloat(formData.previous_reading) || undefined;
        submitData.current_reading = parseFloat(formData.current_reading) || undefined;
        submitData.rate_per_kwh = parseFloat(formData.rate_per_kwh) || undefined;
      }

      // Water data - optional
      if (formData.water_number_of_people || formData.water_fee_per_head) {
        submitData.water_number_of_people = parseInt(formData.water_number_of_people) || undefined;
        submitData.water_fee_per_head = parseFloat(formData.water_fee_per_head) || undefined;
      }

      // Internet data - optional
      if (formData.internet_number_of_devices || formData.internet_fee_per_device) {
        submitData.internet_number_of_devices = parseInt(formData.internet_number_of_devices) || undefined;
        submitData.internet_fee_per_device = parseFloat(formData.internet_fee_per_device) || undefined;
      }

      await meterAPI.createMeterReading(submitData);
      setShowModal(false);
      setSelectedRoom(null);
      setFormData({
        room_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        previous_reading: '',
        current_reading: '',
        rate_per_kwh: '',
        water_number_of_people: '',
        water_fee_per_head: '',
        internet_number_of_devices: '',
        internet_fee_per_device: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save reading');
    }
  };

  const handleOpenModal = (room) => {
    setSelectedRoom(room);
    setFormData({ ...formData, room_id: room.id });
    setShowModal(true);
  };

  if (loading) return <AdminLayout><div className="text-center py-10">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Fee Management</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="card">
              <h3 className="text-lg font-bold mb-2">{room.room_name}</h3>
              <p className="text-gray-600 text-sm mb-4">Status: {room.status}</p>
              <button
                onClick={() => handleOpenModal(room)}
                className="btn-primary"
              >
                Input Fees & Readings
              </button>
            </div>
          ))}
        </div>

        {showModal && (
          <ReadingModal
            room={selectedRoom}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSaveReading}
            onClose={() => {
              setShowModal(false);
              setSelectedRoom(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function ReadingModal({ room, formData, setFormData, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-full overflow-y-auto">
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Input Fees & Readings</h2>
            <p className="text-gray-600">{room?.room_name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Month *</label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Year *</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Water Fee Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3 text-blue-600">Water Fee</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Number of People</label>
                <input
                  type="number"
                  min="1"
                  value={formData.water_number_of_people}
                  onChange={(e) =>
                    setFormData({ ...formData, water_number_of_people: e.target.value })
                  }
                  className="input-field"
                  placeholder="e.g., 2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fee per Head (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.water_fee_per_head}
                  onChange={(e) =>
                    setFormData({ ...formData, water_fee_per_head: e.target.value })
                  }
                  className="input-field"
                  placeholder="e.g., 100"
                />
              </div>
            </div>
            {formData.water_number_of_people && formData.water_fee_per_head && (
              <p className="text-sm text-gray-600 mt-2">
                Total Water Fee: ₱
                {(parseFloat(formData.water_number_of_people) * parseFloat(formData.water_fee_per_head)).toFixed(2)}
              </p>
            )}
          </div>

          {/* Electricity Fee Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3 text-blue-600">Electricity Fee</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Previous Reading (kWh)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.previous_reading}
                  onChange={(e) =>
                    setFormData({ ...formData, previous_reading: e.target.value })
                  }
                  className="input-field"
                  placeholder="e.g., 100.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Reading (kWh)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.current_reading}
                  onChange={(e) =>
                    setFormData({ ...formData, current_reading: e.target.value })
                  }
                  className="input-field"
                  placeholder="e.g., 150.5"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Rate per kWh (₱)</label>
              <input
                type="number"
                step="0.01"
                value={formData.rate_per_kwh}
                onChange={(e) => setFormData({ ...formData, rate_per_kwh: e.target.value })}
                className="input-field"
                placeholder="e.g., 10.50"
              />
            </div>
            {formData.previous_reading && formData.current_reading && formData.rate_per_kwh && (
              <p className="text-sm text-gray-600 mt-2">
                Usage:{' '}
                {(parseFloat(formData.current_reading) - parseFloat(formData.previous_reading)).toFixed(2)}{' '}
                kWh × ₱{parseFloat(formData.rate_per_kwh).toFixed(2)} = ₱
                {(
                  (parseFloat(formData.current_reading) - parseFloat(formData.previous_reading)) *
                  parseFloat(formData.rate_per_kwh)
                ).toFixed(2)}
              </p>
            )}
          </div>

          {/* Internet Fee Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3 text-blue-600">Internet Fee</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Number of Devices</label>
                <input
                  type="number"
                  min="1"
                  value={formData.internet_number_of_devices}
                  onChange={(e) =>
                    setFormData({ ...formData, internet_number_of_devices: e.target.value })
                  }
                  className="input-field"
                  placeholder="e.g., 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fee per Device (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.internet_fee_per_device}
                  onChange={(e) =>
                    setFormData({ ...formData, internet_fee_per_device: e.target.value })
                  }
                  className="input-field"
                  placeholder="e.g., 100"
                />
              </div>
            </div>
            {formData.internet_number_of_devices && formData.internet_fee_per_device && (
              <p className="text-sm text-gray-600 mt-2">
                Total Internet Fee: ₱
                {(parseFloat(formData.internet_number_of_devices) * parseFloat(formData.internet_fee_per_device)).toFixed(2)}
              </p>
            )}
          </div>

          <div className="border-t pt-4 flex gap-4">
            <button type="submit" className="btn-primary flex-1">
              Save All Readings
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
