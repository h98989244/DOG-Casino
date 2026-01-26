import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import MemberBackButton from '../../components/MemberBackButton';
import { useUserProfile } from '../../hooks/useUserProfile';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

interface MemberProfilePageProps {
    setMemberSubPage: (page: string) => void;
}

const MemberProfilePage: React.FC<MemberProfilePageProps> = ({ setMemberSubPage }) => {
    const { profile, loading, error, updateProfile } = useUserProfile();
    const [editing, setEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: '',
        bank_account: ''
    });
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    if (loading) {
        return <LoadingSpinner text="載入個人資料中..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (!profile) {
        return <ErrorMessage message="無法獲取個人資料" />;
    }

    const handleEdit = (field: string, currentValue: string) => {
        setEditing(field);
        setFormData({ ...formData, [field]: currentValue });
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveMessage('');

        const updates: any = {};
        if (formData.full_name) updates.full_name = formData.full_name;

        const result = await updateProfile(updates);

        if (result.success) {
            setSaveMessage('儲存成功!');
            setEditing(null);
            setTimeout(() => setSaveMessage(''), 3000);
        } else {
            setSaveMessage(result.error || '儲存失敗');
        }

        setSaving(false);
    };

    // 格式化日期
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-TW');
    };

    return (
        <div className="space-y-4 pb-20">
            <MemberBackButton setMemberSubPage={setMemberSubPage} />
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">👤</span>
                個人資料
            </h1>

            {saveMessage && (
                <div className={`p-3 rounded-2xl text-center font-bold ${saveMessage.includes('成功')
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                    {saveMessage}
                </div>
            )}

            <div className="bg-white rounded-3xl p-6 shadow-md space-y-4">
                <div className="text-center mb-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full mx-auto flex items-center justify-center text-5xl mb-3">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            '🐕'
                        )}
                    </div>
                    <button className="text-blue-500 text-sm font-bold">更換頭像</button>
                </div>

                {[
                    { label: '會員帳號', value: profile.username || '未設定', field: 'username', editable: false },
                    { label: '真實姓名', value: profile.full_name || '未設定', field: 'full_name', editable: true },
                    { label: '電子郵件', value: '***@***.com', field: 'email', editable: false },
                    { label: '推薦碼', value: profile.referral_code || '未設定', field: 'referral_code', editable: false },
                    { label: '註冊時間', value: formatDate(profile.created_at), field: 'created_at', editable: false }
                ].map((field, idx) => (
                    <div key={idx} className="border-b pb-3 last:border-b-0">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{field.label}</span>
                            {field.editable && editing !== field.field && (
                                <button
                                    onClick={() => handleEdit(field.field, field.value)}
                                    className="text-blue-500 text-sm font-bold"
                                >
                                    編輯
                                </button>
                            )}
                        </div>
                        {editing === field.field ? (
                            <input
                                type="text"
                                value={formData[field.field as keyof typeof formData]}
                                onChange={(e) => setFormData({ ...formData, [field.field]: e.target.value })}
                                className="w-full mt-1 px-3 py-2 border-2 border-blue-300 rounded-xl font-bold text-gray-800"
                                autoFocus
                            />
                        ) : (
                            <div className="font-bold text-gray-800 mt-1">{field.value}</div>
                        )}
                    </div>
                ))}

                {editing && (
                    <div className="flex space-x-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 bg-blue-500 text-white py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
                        >
                            {saving ? '儲存中...' : '儲存變更'}
                        </button>
                        <button
                            onClick={() => setEditing(null)}
                            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform"
                        >
                            取消
                        </button>
                    </div>
                )}
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
