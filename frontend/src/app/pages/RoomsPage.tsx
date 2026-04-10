import { useState } from 'react';
import { BedDouble, CheckCircle, AlertCircle, Wrench, Plus, Edit, X } from 'lucide-react';
import { mockRooms, getStatusColor, getStatusLabel } from '../mockData';
import { Room } from '../types';

function RoomModal({ room, onClose, onSave }: {
  room: Partial<Room> | null;
  onClose: () => void;
  onSave: (r: Partial<Room>) => void;
}) {
  const [form, setForm] = useState<Partial<Room>>(room || {
    name: '', number: '', type: 'Konsultatsiya', status: 'available', floor: 1, doctor: ''
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">{room?.id ? 'Xonani tahrirlash' : 'Yangi xona'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Xona nomi</label>
              <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="1-xona" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Raqami</label>
              <input value={form.number || ''} onChange={e => setForm({ ...form, number: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="101" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Turi</label>
              <select value={form.type || 'Konsultatsiya'} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Konsultatsiya</option>
                <option>Diagnostika</option>
                <option>Davolash</option>
                <option>Laboratoriya</option>
                <option>Operatsiya</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Qavat</label>
              <input type="number" value={form.floor || 1} onChange={e => setForm({ ...form, floor: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Holat</label>
            <select value={form.status || 'available'} onChange={e => setForm({ ...form, status: e.target.value as Room['status'] })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="available">Bo'sh</option>
              <option value="occupied">Band</option>
              <option value="maintenance">Ta'mirda</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Mas'ul shifokor</label>
            <select value={form.doctor || ''} onChange={e => setForm({ ...form, doctor: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Belgilanmagan</option>
              <option>Dr. Nilufar Karimova</option>
              <option>Dr. Jasur Rahimov</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors">Bekor qilish</button>
          <button onClick={() => onSave(form)} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors font-medium">Saqlash</button>
        </div>
      </div>
    </div>
  );
}

const statusIcons: Record<string, React.ReactNode> = {
  available: <CheckCircle size={18} className="text-green-600" />,
  occupied: <AlertCircle size={18} className="text-amber-600" />,
  maintenance: <Wrench size={18} className="text-red-600" />,
};

const typeColors: Record<string, string> = {
  'Konsultatsiya': 'bg-blue-100 text-blue-700',
  'Diagnostika': 'bg-green-100 text-green-700',
  'Davolash': 'bg-amber-100 text-amber-700',
  'Laboratoriya': 'bg-purple-100 text-purple-700',
  'Operatsiya': 'bg-red-100 text-red-700',
};

export function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState<Partial<Room> | null>(null);

  const handleSave = (form: Partial<Room>) => {
    if (form.id) {
      setRooms(prev => prev.map(r => r.id === form.id ? { ...r, ...form } as Room : r));
    } else {
      setRooms(prev => [...prev, { ...form as Room, id: 'r' + Date.now() }]);
    }
    setShowModal(false);
    setEditRoom(null);
  };

  const changeStatus = (id: string, status: Room['status']) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const available = rooms.filter(r => r.status === 'available').length;
  const occupied = rooms.filter(r => r.status === 'occupied').length;
  const maintenance = rooms.filter(r => r.status === 'maintenance').length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm text-center">
          <div className="text-3xl font-bold text-green-600">{available}</div>
          <div className="text-sm text-muted-foreground mt-1">Bo'sh xonalar</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm text-center">
          <div className="text-3xl font-bold text-amber-600">{occupied}</div>
          <div className="text-sm text-muted-foreground mt-1">Band xonalar</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm text-center">
          <div className="text-3xl font-bold text-red-600">{maintenance}</div>
          <div className="text-sm text-muted-foreground mt-1">Ta'mirda</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-foreground">Barcha xonalar ({rooms.length} ta)</h3>
        <button
          onClick={() => { setEditRoom(null); setShowModal(true); }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium">
          <Plus size={16} />
          Yangi xona
        </button>
      </div>

      {/* Room Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map(room => (
          <div key={room.id} className={`bg-white dark:bg-slate-800 rounded-2xl border-2 shadow-sm overflow-hidden transition-all hover:shadow-md ${
            room.status === 'available' ? 'border-green-200 dark:border-green-800' :
            room.status === 'occupied' ? 'border-amber-200 dark:border-amber-800' :
            'border-red-200 dark:border-red-800'
          }`}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    room.status === 'available' ? 'bg-green-50 dark:bg-green-900/30' :
                    room.status === 'occupied' ? 'bg-amber-50 dark:bg-amber-900/30' :
                    'bg-red-50 dark:bg-red-900/30'
                  }`}>
                    <BedDouble size={20} className={
                      room.status === 'available' ? 'text-green-600' :
                      room.status === 'occupied' ? 'text-amber-600' :
                      'text-red-600'
                    } />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{room.name}</div>
                    <div className="text-xs text-muted-foreground">№{room.number} · {room.floor}-qavat</div>
                  </div>
                </div>
                <button
                  onClick={() => { setEditRoom(room); setShowModal(true); }}
                  className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
                  <Edit size={15} />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[room.type] || 'bg-gray-100 text-gray-700'}`}>
                  {room.type}
                </span>
                <div className="flex items-center gap-1">
                  {statusIcons[room.status]}
                  <span className={`text-xs font-medium ${
                    room.status === 'available' ? 'text-green-600' :
                    room.status === 'occupied' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>{getStatusLabel(room.status)}</span>
                </div>
              </div>

              {room.doctor && (
                <div className="text-xs text-muted-foreground mb-3">
                  <span className="font-medium text-foreground">Shifokor:</span> {room.doctor}
                </div>
              )}

              <div className="flex gap-2">
                {(['available', 'occupied', 'maintenance'] as Room['status'][]).map(s => (
                  <button
                    key={s}
                    onClick={() => changeStatus(room.id, s)}
                    className={`flex-1 py-1.5 rounded-lg text-xs transition-colors ${
                      room.status === s
                        ? s === 'available' ? 'bg-green-600 text-white' :
                          s === 'occupied' ? 'bg-amber-600 text-white' :
                          'bg-red-600 text-white'
                        : 'border border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {getStatusLabel(s)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <RoomModal
          room={editRoom}
          onClose={() => { setShowModal(false); setEditRoom(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
