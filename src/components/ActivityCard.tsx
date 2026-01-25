import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';

interface Activity {
    id: number;
    title: string;
    bonus: string;
    bonusAmount: string;
    time: string;
    desc: string;
    icon: string;
}

interface ActivityCardProps {
    activity: Activity;
    onClick: (id: number) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick }) => {
    return (
        <div
            className="bg-white rounded-2xl p-5 shadow-md hover:scale-105 transition-transform cursor-pointer"
            onClick={() => onClick(activity.id)}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-3xl">{activity.icon}</span>
                        <h3 className="font-bold text-gray-800">{activity.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{activity.desc}</p>
                    <div className="flex items-center space-x-3 text-sm">
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold">
                            {activity.bonus}
                        </span>
                        <span className="text-orange-600 font-bold">
                            {activity.bonusAmount}
                        </span>
                        <span className="text-gray-500 flex items-center">
                            <Clock size={14} className="mr-1" />
                            {activity.time}
                        </span>
                    </div>
                </div>
            </div>
            <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-2 rounded-xl font-bold shadow-md flex items-center justify-center">
                查看詳情
                <ChevronRight size={18} className="ml-1" />
            </button>
        </div>
    );
};

export default ActivityCard;
