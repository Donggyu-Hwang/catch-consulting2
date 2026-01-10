import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminAuth from '../components/AdminAuth';

const Dashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [allWaitlist, setAllWaitlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedItems, setExpandedItems] = useState({});
    const [showCancelledCompleted, setShowCancelledCompleted] = useState(true);

    const listTypes = ['이력서1', '이력서2', '기업추천1', '기업추천2'];

    // Status configuration
    const statusConfig = {
        onsite: {
            label: '현장',
            shortLabel: '현장',
            color: 'bg-green-100 text-green-700',
            borderColor: 'border-green-300',
            order: 0
        },
        absent: {
            label: '부재중',
            shortLabel: '부재',
            color: 'bg-yellow-100 text-yellow-700',
            borderColor: 'border-yellow-300',
            order: 1
        },
        called: {
            label: '전화완료',
            shortLabel: '통화',
            color: 'bg-purple-100 text-purple-700',
            borderColor: 'border-purple-300',
            order: 2
        },
        waiting: {
            label: '전화대기',
            shortLabel: '대기',
            color: 'bg-blue-100 text-blue-700',
            borderColor: 'border-blue-300',
            order: 3
        },
        completed: {
            label: '완료',
            shortLabel: '완료',
            color: 'bg-gray-200 text-gray-700',
            borderColor: 'border-gray-300',
            order: 4
        },
        cancelled: {
            label: '취소',
            shortLabel: '취소',
            color: 'bg-red-100 text-red-700',
            borderColor: 'border-red-300',
            order: 5
        }
    };

    const statusButtons = [
        { key: 'called', label: '📞 전화 완료', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
        { key: 'onsite', label: '🏢 현장 대기', color: 'bg-green-50 text-green-600 hover:bg-green-100' },
        { key: 'absent', label: '⚠️ 부재중', color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' },
        { key: 'postpone', label: '⏰ 한 명 뒤로', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100', isPostpone: true },
        { key: 'completed', label: '✅ 완료', color: 'bg-gray-50 text-gray-600 hover:bg-gray-100' },
        { key: 'cancelled', label: '❌ 취소', color: 'bg-red-50 text-red-600 hover:bg-red-100' },
        { key: 'waiting', label: '🔄 대기로', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' }
    ];

    const fetchList = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/waitlist');
            setAllWaitlist(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const authStatus = sessionStorage.getItem('adminAuth');
        if (authStatus === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchList();
            const interval = setInterval(() => fetchList(), 10000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:3001/api/waitlist/${id}`, { status });
            fetchList();
        } catch (err) {
            alert('상태 업데이트 오류');
        }
    };

    const postponePerson = async (id) => {
        try {
            const res = await axios.put(`http://localhost:3001/api/waitlist/${id}/postpone`);
            if (res.data.swapped) {
                alert(`${res.data.current.name}님과 ${res.data.next.name}님의 순서를 바꿨습니다.`);
            }
            fetchList();
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message;
            if (errorMsg.includes('No next person')) {
                alert('마지막 순서라 미룰 수 없습니다.');
            } else {
                alert('순서 변경 오류: ' + errorMsg);
            }
        }
    };

    const getFilteredItems = (listType) => {
        return allWaitlist.filter(item => {
            const matchesType = item.list_type === listType;
            const matchesSearch = !searchTerm ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.phone.includes(searchTerm) ||
                item.job_group.toLowerCase().includes(searchTerm.toLowerCase());
            const showItem = showCancelledCompleted || (item.status !== 'cancelled' && item.status !== 'completed');
            return matchesType && matchesSearch && showItem;
        });
    };

    const toggleExpand = (itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const renderColumn = (listType, colorClass) => {
        const items = getFilteredItems(listType);

        // Get ALL items for this list type (not filtered by search) to calculate original positions
        const allItemsForType = allWaitlist.filter(item => item.list_type === listType);
        const sortedAllItems = [...allItemsForType].sort((a, b) => {
            return new Date(a.created_at) - new Date(b.created_at);
        });

        // Create a map of item ID to its original position in the full list
        const itemPositionMap = {};
        sortedAllItems.forEach((item, index) => {
            itemPositionMap[item.id] = index + 1;
        });

        // Sort filtered items by created_at
        const sortedItems = [...items].sort((a, b) => {
            return new Date(a.created_at) - new Date(b.created_at);
        });

        // Count waiting status only
        const waitingCount = sortedItems.filter(item => item.status === 'waiting').length;
        const totalCount = sortedAllItems.length;

        return (
            <div key={listType} className="flex flex-col bg-gray-50 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className={`${colorClass} px-2 sm:px-3 py-1.5 sm:py-2 text-white`}>
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm sm:text-base font-bold">{listType}</h2>
                        <div className="flex gap-0.5 sm:gap-1">
                            <div className="bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
                                전체: {totalCount}
                            </div>
                            <div className="bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
                                대기: {waitingCount}
                            </div>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-auto p-1 sm:p-1.5 space-y-1 sm:space-y-1.5">
                    {sortedItems.map((item) => {
                        const config = statusConfig[item.status] || statusConfig.waiting;
                        const isExpanded = expandedItems[item.id];
                        const isWaiting = item.status === 'waiting';

                        return (
                            <div
                                key={item.id}
                                className={`bg-white rounded-lg shadow-sm hover:shadow-md ${
                                    isWaiting ? 'border-2 ' + config.borderColor : ''
                                }`}
                            >
                                {/* Main Card */}
                                <div className="p-1.5 sm:p-2">
                                    <div className="flex justify-between items-start mb-1 sm:mb-1.5">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 truncate text-sm sm:text-base">{item.name}</p>
                                            <p className="text-[10px] sm:text-xs text-gray-500 truncate">{item.phone}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleExpand(item.id)}
                                            className="text-gray-400 hover:text-gray-600 text-[10px] sm:text-xs whitespace-nowrap ml-1 sm:ml-2"
                                        >
                                            {isExpanded ? '▲ 접기' : '▼ 변경'}
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                                        <span className="px-1.5 sm:px-2 py-0.5 bg-gray-100 rounded text-[10px] sm:text-xs font-semibold">
                                            {item.job_group}
                                        </span>
                                        <span className="text-[10px] sm:text-xs text-gray-400">{item.years}년</span>
                                        <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold ${config.color}`}>
                                            {config.label}
                                        </span>
                                    </div>

                                    <div className="text-[10px] sm:text-xs text-gray-400">
                                        {new Date(item.created_at).toLocaleString('ko-KR', {
                                            month: 'numeric',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>

                                {/* Expanded Action Buttons */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 p-1 sm:p-1.5 bg-gray-50">
                                        <div className="grid grid-cols-2 gap-0.5 sm:gap-1">
                                            {statusButtons.map(btn => (
                                                <button
                                                    key={btn.key}
                                                    onClick={() => {
                                                        if (btn.isPostpone) {
                                                            postponePerson(item.id);
                                                        } else {
                                                            updateStatus(item.id, btn.key);
                                                        }
                                                    }}
                                                    className={`px-1.5 sm:px-2 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-semibold transition-colors ${btn.color}`}
                                                >
                                                    {btn.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {sortedItems.length === 0 && (
                        <div className="text-center py-6 sm:py-8 text-gray-400 text-xs sm:text-sm">
                            {searchTerm ? '검색 결과 없음' : '대기자 없음'}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (!isAuthenticated) {
        return <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />;
    }

    const totalWaiting = allWaitlist.filter(item => item.status === 'waiting').length;

    return (
        <div className="p-2 sm:p-4 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl h-[95vh] w-[98vw] max-w-[1800px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">컨설팅 대기 관리</h1>
                </div>
                <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                    <div className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap">
                        대기: {totalWaiting}
                    </div>
                    <div className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap">
                        현장: {allWaitlist.filter(item => item.status === 'onsite').length}
                    </div>
                    <div className="bg-yellow-100 text-yellow-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap">
                        부재: {allWaitlist.filter(item => item.status === 'absent').length}
                    </div>
                    <div className="bg-purple-100 text-purple-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap">
                        전화완료: {allWaitlist.filter(item => item.status === 'called').length}
                    </div>
                    <div className="bg-gray-200 text-gray-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap">
                        완료: {allWaitlist.filter(item => item.status === 'completed').length}
                    </div>
                    <div className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap">
                        취소: {allWaitlist.filter(item => item.status === 'cancelled').length}
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="mb-2">
                <input
                    type="text"
                    placeholder="🔍 이름, 전화번호, 직무로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm sm:text-base"
                />
            </div>

            {/* Toggle Buttons */}
            <div className="mb-2 flex gap-2 sm:gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showCancelledCompleted}
                        onChange={(e) => setShowCancelledCompleted(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">완료/취소 표시</span>
                </label>
            </div>

            {/* Status Legend */}
            {/* <div className="mb-2 flex gap-2 flex-wrap">
                {Object.entries(statusConfig).map(([key, config]) => (
                    <span key={key} className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                        {config.label}
                    </span>
                ))}
            </div> */}

            {/* 4 Column Grid - Responsive */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 overflow-auto">
                {renderColumn('이력서1', 'bg-blue-600')}
                {renderColumn('이력서2', 'bg-green-600')}
                {renderColumn('기업추천1', 'bg-purple-600')}
                {renderColumn('기업추천2', 'bg-orange-600')}
            </div>

            {/* Footer */}
            <div className="mt-2 pt-2 border-t text-[10px] sm:text-xs text-gray-400 flex justify-between">
                <span>10초마다 자동 새로고침</span>
                <span>총 인원: {allWaitlist.length}명</span>
            </div>
        </div>
    );
};

export default Dashboard;
