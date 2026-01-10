import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'qrcode';

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const fixedType = searchParams.get('type');

    const listTypes = ['이력서1', '이력서2', '기업추천1', '기업추천2'];
    // Decode URI component to handle Korean characters
    const decodedType = fixedType ? decodeURIComponent(fixedType) : null;
    const isValidType = decodedType && listTypes.includes(decodedType);

    const [formData, setFormData] = useState({
        name: '',
        job_group: '',
        years: '',
        phone: '',
        list_type: isValidType ? decodedType : '이력서1'
    });
    const [loading, setLoading] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [registeredPhone, setRegisteredPhone] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const canvasRef = useRef(null);

    useEffect(() => {
        if (showQRModal && registeredPhone) {
            const statusUrl = `${window.location.origin}/status?phone=${registeredPhone}`;
            QRCode.toDataURL(statusUrl, { width: 200, margin: 2 }, (error, url) => {
                if (error) {
                    console.error('QR Code generation error:', error);
                } else {
                    setQrCodeUrl(url);
                }
            });
        }
    }, [showQRModal, registeredPhone]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:3001/api/waitlist', formData);
            setRegisteredPhone(formData.phone);
            setShowQRModal(true);
        } catch (error) {
            alert('대기 목록 등록 오류: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const statusUrl = registeredPhone ? `${window.location.origin}/status?phone=${registeredPhone}` : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20"
        >
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                스타트업 채용박람회<br/>
                컨설팅 신청
            </h1>
            {isValidType && (
                <p className="text-center mb-4">
                    <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-lg">
                        {decodedType}
                    </span>
                </p>
            )}
            <p className="text-gray-500 text-center mb-8">
                {isValidType ? `${decodedType} 대기 등록` : '상담 대기 등록'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                    <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                        placeholder="홍길동"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">희망 직무 분야</label>
                    <input
                        required
                        type="text"
                        name="job_group"
                        value={formData.job_group}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                        placeholder="예: 전략, IT, HR"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">경력 (년)</label>
                    <input
                        required
                        type="number"
                        name="years"
                        value={formData.years}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                        placeholder="예: 5"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                    <input
                        required
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                        placeholder="010-1234-5678"
                    />
                </div>

                {!isValidType && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">대기 목록 선택</label>
                        <select
                            name="list_type"
                            value={formData.list_type}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                        >
                            <option value="이력서1">이력서1</option>
                            <option value="이력서2">이력서2</option>
                            <option value="기업추천1">기업추천1</option>
                            <option value="기업추천2">기업추천2</option>
                        </select>
                    </div>
                )}

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] mt-6"
                >
                    {loading ? '등록 중...' : '대기 등록'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <a href="/status" className="text-sm text-emerald-600 hover:text-emerald-800 font-medium">
                    이미 등록하셨나요? 상태 확인
                </a>
            </div>

            {/* QR Code Modal */}
            {showQRModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowQRModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-8 max-w-md w-full text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">등록 완료!</h2>
                            <p className="text-gray-600">대기 등록이 완료되었습니다</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border-2 border-emerald-100 mb-6">
                            <p className="text-sm text-gray-500 mb-4">아래 QR 코드를 스캔하여<br/>나의 대기 현황을 확인하세요</p>
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-white rounded-xl shadow-lg">
                                    {qrCodeUrl ? (
                                        <img src={qrCodeUrl} alt="QR Code" style={{ width: 200, height: 200 }} />
                                    ) : (
                                        <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100 rounded-lg">
                                            <span className="text-gray-400 text-sm">QR 생성 중...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 break-all">{statusUrl}</p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate(`/status?phone=${registeredPhone}`)}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
                            >
                                대기 현황 확인하기
                            </button>
                            <button
                                onClick={() => {
                                    setShowQRModal(false);
                                    // Reset form but keep current type
                                    const currentType = isValidType ? decodedType : '이력서1';
                                    setFormData({
                                        name: '',
                                        job_group: '',
                                        years: '',
                                        phone: '',
                                        list_type: currentType
                                    });
                                    setQrCodeUrl('');
                                }}
                                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                            >
                                닫기
                            </button>
                        </div>

                        <p className="mt-4 text-xs text-gray-400">
                            QR 코드를 캡처하거나 저장해두세요
                        </p>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default Register;
