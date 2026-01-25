import React from 'react';
import { MessageCircle } from 'lucide-react';

const LineButton: React.FC = () => {
    return (
        <a
            href="https://line.me/ti/p/@your-line-id"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-24 right-4 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center"
        >
            <MessageCircle size={28} />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                客服
            </div>
        </a>
    );
};

export default LineButton;
