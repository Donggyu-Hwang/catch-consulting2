import React from 'react';

const Landing = () => {
    return (
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20 w-full max-w-md">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    스타트업 채용박람회
                </h1>
                <h2 className="text-2xl font-bold text-emerald-600 mb-6">
                    컨설팅 대기 안내
                </h2>

                <div className="text-left space-y-4 text-gray-600 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-bold text-gray-800 mb-2">📋 대기 카테고리</h3>
                        <ul className="space-y-1 text-sm">
                            <li>• 이력서 1</li>
                            <li>• 이력서 2</li>
                            <li>• 기업추천 1</li>
                            <li>• 기업추천 2</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="font-bold text-blue-800 mb-2">📝 신청 방법</h3>
                        <p className="text-sm">
                            QR 코드를 스캔하거나<br/>
                            직접 방문하여 신청해주세요
                        </p>
                    </div>

                    <div className="bg-emerald-50 rounded-lg p-4">
                        <h3 className="font-bold text-emerald-800 mb-2">🔍 상태 확인</h3>
                        <p className="text-sm">
                            등록 후 발급된 QR 코드로<br/>
                            대기 현황을 실시간으로 확인할 수 있습니다
                        </p>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4">
                        <h3 className="font-bold text-yellow-800 mb-2">⏰ 대기 시간</h3>
                        <p className="text-sm">
                            현재 대기 인원에 따라<br/>
                            상담 시간이 달라질 수 있습니다
                        </p>
                    </div>
                </div>

                {/* Check Status Button */}
                <a
                    href="/status"
                    className="inline-block w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
                >
                    대기 인원 확인하기
                </a>
            </div>
        </div>
    );
};

export default Landing;
