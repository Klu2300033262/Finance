import { useAuth } from '../contexts/AuthContext';
import { Clock, LogOut } from 'lucide-react';

export default function SessionInfo() {
  const { user, session, signOut } = useAuth();

  if (!user || !session) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-sm text-blue-800">
              Logged in as <span className="font-semibold">{user.email}</span>
            </p>
            <p className="text-xs text-blue-600">
              Session active • JWT Token
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
