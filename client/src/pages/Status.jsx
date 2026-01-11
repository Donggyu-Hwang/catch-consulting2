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
            if (res.data.message === 'found' && res.data.data.length > 0) {
                setStatusData(res.data.data);
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
                    <div className="text-center">
                        <p className="text-lg font-semibold text-gray-700">
                            총 {statusData.length}개의 대기 목록
                        </p>
                    </div>

                    {statusData.map((item) => {
                        // Status badge colors
                        const statusConfig = {
                            consulting: { label: '컨설팅 진행중', color: 'bg-indigo-100 text-indigo-700' },
                            waiting: { label: '전화대기', color: 'bg-blue-100 text-blue-700' },
                            called: { label: '전화완료', color: 'bg-purple-100 text-purple-700' },
                            onsite: { label: '현장대기', color: 'bg-green-100 text-green-700' },
                            absent: { label: '부재중', color: 'bg-yellow-100 text-yellow-700' }
                        };
                        const config = statusConfig[item.status] || statusConfig.waiting;

                        return (
                            <div key={item.id} className="bg-emerald-50 rounded-xl p-4 text-left space-y-3">
                                <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-emerald-700 text-lg">{item.list_type}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${config.color}`}>
                                            {config.label}
                                        </span>
                                    </div>
                                    <div className="text-4xl font-black text-emerald-600">
                                        {item.ahead + 1}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 text-sm">이름</span>
                                        <span className="font-semibold text-gray-900">{item.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 text-sm">직무 분야</span>
                                        <span className="font-semibold text-gray-900">{item.job_group}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 text-sm">경력</span>
                                        <span className="font-semibold text-gray-900">{item.years}년</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 text-sm">등록 시간</span>
                                        <span className="font-semibold text-gray-900">
                                            {new Date(item.created_at).toLocaleString('ko-KR', {
                                                month: 'numeric',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-emerald-200 text-center">
                                    <span className="text-emerald-600 font-bold">
                                        {item.ahead + 1}번째 순서입니다
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    <div className="text-sm text-gray-400 text-center">
                        30초마다 자동으로 새로고침됩니다
                    </div>

                    <button onClick={() => navigate('/')} className="text-emerald-600 hover:text-emerald-800 font-medium text-sm w-full">
                        홈으로 돌아가기
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default Status;
