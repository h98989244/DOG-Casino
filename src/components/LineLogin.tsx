import React, { useEffect, useState } from 'react';
import { LiffService, LiffUser } from '../lib/liff';

export const LineLogin: React.FC = () => {
    const [user, setUser] = useState<LiffUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const result = await LiffService.init();
            if (result.error) {
                setError(String(result.error));
                setLoading(false);
                return;
            }

            if (result.isLoggedIn) {
                const profile = await LiffService.getProfile();
                setUser(profile);
            }
            setLoading(false);
        };

        init();
    }, []);

    const handleLogin = () => {
        LiffService.login();
    };

    const handleLogout = () => {
        LiffService.logout();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-500 rounded-md">
                <p>LIFF Error: {error}</p>
            </div>
        );
    }

    if (user) {
        return (
            <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
                {user.pictureUrl ? (
                    <img
                        src={user.pictureUrl}
                        alt={user.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-xl">{user.displayName[0]}</span>
                    </div>
                )}
                <div>
                    <p className="font-medium text-gray-900">{user.displayName}</p>
                    <p className="text-xs text-gray-500">{user.email || 'LINE User'}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="ml-auto px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                    登出
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleLogin}
            className="flex items-center gap-2 px-6 py-3 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-lg font-bold transition-all transform active:scale-95 shadow-md"
        >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                <path d="M21.156 8.955c-.279-3.793-3.053-6.527-6.223-7.519-4.832-1.51-9.981 1.053-11.491 5.885-1.045 3.344.204 6.726 2.82 8.974.195.168.29.416.257.668l-.167 1.353c-.042.348.339.593.635.409l1.797-1.118a.658.658 0 01.356-.104c3.088.082 5.923-1.464 7.635-4.167 1.258-1.983 1.66-4.382 1.381-6.726zM11.954 13.921h-5.26c-.366 0-.662-.296-.662-.662 0-.366.296-.662.662-.662h4.598v-2.004H6.694c-.366 0-.662-.296-.662-.662 0-.366.296-.662.662-.662h4.598V7.265H6.694c-.366 0-.662-.296-.662-.662 0-.366.296-.662.662-.662h5.26c.366 0 .662.296.662.662v6.656c0 .366-.296.662-.662.662z" />
            </svg>
            LINE 登入
        </button>
    );
};
