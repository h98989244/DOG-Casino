import React from 'react';
import { ChevronRight } from 'lucide-react';

interface MemberBackButtonProps {
    setMemberSubPage: (page: string) => void;
}

const MemberBackButton: React.FC<MemberBackButtonProps> = ({ setMemberSubPage }) => {
    return (
        <button
            onClick={() => setMemberSubPage('main')}
            className="flex items-center text-blue-500 font-bold mb-4 hover:scale-105 transition-transform"
        >
            <ChevronRight size={20} className="rotate-180" />
            返回
        </button>
    );
};

export default MemberBackButton;
