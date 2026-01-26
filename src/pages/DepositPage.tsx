import React from 'react';
import { CreditCard, DollarSign } from 'lucide-react';

const DepositPage: React.FC = () => {
    return (
        <div className="space-y-4 pb-20">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">💰</span>
                儲值/提領
            </h1>

            {/* 餘額卡片 */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-300 rounded-3xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm opacity-90">當前餘額</span>
                    <span className="text-2xl">🐕‍🦺</span>
                </div>
                <div className="text-4xl font-bold mb-2">NT$ 12,888</div>
                <div className="text-sm opacity-90">VIP 等級:🦴🦴🦴 金牌會員</div>
            </div>

            {/* 儲值選項 */}
            <div className="bg-white rounded-3xl p-5 shadow-md">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <CreditCard size={20} className="mr-2" />
                    快速儲值
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {['1000', '3000', '5000', '10000', '30000', '50000'].map(amount => (
                        <button
                            key={amount}
                            className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-2xl py-3 font-bold text-blue-600 transition-all hover:scale-105"
                        >
                            ${amount}
                        </button>
                    ))}
                </div>
                <button className="w-full bg-blue-500 text-white py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform">
                    確認儲值
                </button>
            </div>

            {/* 提領 */}
            {/* <div className="bg-white rounded-3xl p-5 shadow-md">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <DollarSign size={20} className="mr-2" />
                    提領申請
                </h3>
                <input
                    type="text"
                    placeholder="請輸入提領金額"
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 mb-3 focus:border-blue-400 outline-none"
                />
                <button className="w-full bg-green-500 text-white py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform">
                    提交申請
                </button>
            </div> */}
        </div>
    );
};

export default DepositPage;
