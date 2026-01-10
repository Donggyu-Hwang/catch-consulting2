import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import api from '../utils/api';

const Status = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [phone, setPhone] = useState(searchParams.get('phone') || '');
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const checkStatus = async (phoneNumber) => {
        if (!phoneNumber) return;
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/waitlist/status/${phoneNumber}`);
            if (res.data.message === 'found') {
                setStatusData(res.data);
            } else {
                setError('해당 번호로 대기 중인 기록이 없습니다.');
                setStatusData(null);
            }
        } catch (err) {
            setError('상태 확인 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-check if phone in URL
    useEffect(() => {
        const phoneParam = searchParams.get('phone');
        if (phoneParam) {
            checkStatus(phoneParam);
            // Poll every 30s
            const interval = setInterval(() => checkStatus(phoneParam), 30000);
            return () => clearInterval(interval);
        }
    }, [searchParams]);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/status?phone=${phone}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20 text-center"
        >
            <h1 className="text-2xl font-bold text-gray-800 mb-6">대기 순번 확인</h1>

            {!searchParams.get('phone') && (
                <form onSubmit={handleSearch} className="mb-6">
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="전화번호를 입력하세요"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 mb-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                        상태 확인
                    </button>
                </form>
            )}

            {loading && <p className="text-gray-500 animate-pulse">확인 중...</p>}
            {error && <p className="text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}

            {statusData && (
                <div className="space-y-6">
                    <div className="relative pt-4">
                        <div className="text-6xl font-black text-emerald-600 mb-2">
                            {statusData.ahead + 1}
                        </div>
                        <p className="text-gray-500 font-medium">번째 순서입니다</p>
                    </div>

                    <div className="bg-emerald-50 rounded-xl p-4 text-left space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-500">이름</span>
                            <span className="font-semibold text-gray-900">{statusData.data.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">대기 목록</span>
                            <span className="font-semibold text-gray-900">{statusData.data.list_type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">직무 분야</span>
                            <span className="font-semibold text-gray-900">{statusData.data.job_group}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">등록 시간</span>
                            <span className="font-semibold text-gray-900">
                                {new Date(statusData.data.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <div className="text-sm text-gray-400">
                        30초마다 자동으로 새로고침됩니다
                    </div>

                    <button onClick={() => navigate('/')} className="text-emerald-600 hover:text-emerald-800 font-medium text-sm">
                        홈으로 돌아가기
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default Status;
