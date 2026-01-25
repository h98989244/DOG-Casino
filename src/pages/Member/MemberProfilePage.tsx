import React from 'react';
import { ChevronRight } from 'lucide-react';
import MemberBackButton from '../../components/MemberBackButton';

interface MemberProfilePageProps {
    setMemberSubPage: (page: string) => void;
}

const MemberProfilePage: React.FC<MemberProfilePageProps> = ({ setMemberSubPage }) => {
    return (
        <div className="space-y-4 pb-20">
            <MemberBackButton setMemberSubPage={setMemberSubPage} />
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">👤</span>
                個人資料
            </h1>

            <div className="bg-white rounded-3xl p-6 shadow-md space-y-4">
                <div className="text-center mb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full mx-auto flex items-center justify-center text-5xl mb-3">
                        🐕
                    </div>
                    <button className="text-blue-500 text-sm font-bold">更換頭像</button>
                </div>

                {[
                    { label: '會員帳號', value: 'Wang***88', editable: false },
                    { label: '真實姓名', value: '王小明', editable: true },
                    { label: '手機號碼', value: '0912-345-678', editable: true },
                    { label: '電子郵件', value: 'wang***@gmail.com', editable: true },
                    { label: '銀行帳號', value: '822-***-***-123', editable: true },
                    { label: '註冊時間', value: '2024-01-15', editable: false }
                ].map((field, idx) => (
                    <div key={idx} className="border-b pb-3 last:border-b-0">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{field.label}</span>
                            {field.editable && (
                                <button className="text-blue-500 text-sm font-bold">編輯</button>
                            )}
                        </div>
                        <div className="font-bold text-gray-800 mt-1">{field.value}</div>
                    </div>
                ))}

                <button className="w-full bg-blue-500 text-white py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform mt-4">
                    儲存變更
                </button>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-md">
                <h3 className="font-bold text-gray-800 mb-3">安全設定</h3>
                <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors mb-2">
                    <span className="font-bold text-gray-700">修改密碼</span>
                    <ChevronRight className="text-gray-400" size={20} />
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <span className="font-bold text-gray-700">雙重驗證</span>
                    <ChevronRight className="text-gray-400" size={20} />
                </button>
            </div>
        </div>
    );
};

export default MemberProfilePage;
