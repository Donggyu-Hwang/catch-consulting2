import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AdminAuth = ({ onAuthenticated }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === 'test123456') {
            sessionStorage.setItem('adminAuth', 'true');
            onAuthenticated();
        } else {
            setError('비밀번호가 올바르지 않습니다');
            setPassword('');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20 w-full max-w-md"
        >
            <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">관리자 접근</h1>
            <p className="text-gray-500 text-center mb-6">비밀번호를 입력하세요</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                        placeholder="관리자 비밀번호 입력"
                        autoFocus
                    />
                    {error && (
                        <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    대시보드 접근
                </button>
            </form>
        </motion.div>
    );
};

export default AdminAuth;
