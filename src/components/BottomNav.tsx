import React from 'react';
import { Home, Gamepad2, DollarSign, Gift, User } from 'lucide-react';

interface BottomNavProps {
    currentPage: string;
    setCurrentPage: (page: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 shadow-lg z-50">
            <div className="max-w-md mx-auto flex items-center justify-around py-2">
                {[
                    { page: 'home', icon: <Home size={24} />, label: '首頁' },
                    { page: 'games', icon: <Gamepad2 size={24} />, label: '遊戲' },
                    { page: 'deposit', icon: <DollarSign size={24} />, label: '儲值' },
                    { page: 'activities', icon: <Gift size={24} />, label: '活動' },
                    { page: 'member', icon: <User size={24} />, label: '我的' }
                ].map(item => (
                    <button
                        key={item.page}
                        onClick={() => setCurrentPage(item.page)}
                        className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all ${currentPage === item.page
                                ? 'text-blue-500 bg-blue-50'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {item.icon}
                        <span className="text-xs font-bold">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BottomNav;
