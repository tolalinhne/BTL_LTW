import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle, Clock, Copy, QrCode, X, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';
import { orderService } from '@/services/order.service';
import type { Order } from '@/types/shared.types';

const BANK_ACCOUNT = '96247A3QUR';
const BANK_NAME = 'BIDV';

interface PaymentQRModalProps {
    orderId: number;
    orderCode: string;
    total: number;
    onConfirmed: () => void;
    onClose: () => void;
}

type ModalStatus = 'waiting' | 'confirmed' | 'timeout';

export default function PaymentQRModal({
    orderId,
    orderCode,
    total,
    onConfirmed,
    onClose,
}: PaymentQRModalProps) {
    const [status, setStatus] = useState<ModalStatus>('waiting');
    const [copied, setCopied] = useState<string | null>(null);
    const [remaining, setRemaining] = useState(30 * 60); // 30 phút tính bằng giây
    const stopPollRef = useRef<(() => void) | null>(null);

    // QR URL từ SePay/VietQR
    const qrUrl = `https://qr.sepay.vn/img?acc=${BANK_ACCOUNT}&bank=${BANK_NAME}&amount=${total}&des=${orderCode}&template=compact`;

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Khi hết giờ, show timeout
    useEffect(() => {
        if (remaining === 0 && status === 'waiting') {
            setStatus('timeout');
            stopPollRef.current?.();
        }
    }, [remaining, status]);

    // Polling trạng thái từ backend
    useEffect(() => {
        const stop = orderService.pollPaymentStatus(
            orderId,
            (_order: Order) => {
                setStatus('confirmed');
                stopPollRef.current?.();
                setTimeout(() => onConfirmed(), 2000); // đợi 2s rồi navigate
            },
            () => {
                setStatus('timeout');
            },
            3000,
            30 * 60 * 1000
        );
        stopPollRef.current = stop;
        return () => stop();
    }, [orderId]);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(field);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={status !== 'waiting' ? onClose : undefined} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                {/* Header */}
                <div className={`px-6 py-4 flex items-center justify-between ${
                    status === 'confirmed' ? 'bg-green-50 border-b border-green-100' :
                    status === 'timeout' ? 'bg-red-50 border-b border-red-100' :
                    'bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100'
                }`}>
                    <div className="flex items-center gap-2">
                        {status === 'confirmed' ? (
                            <CheckCircle className="text-green-500" size={22} />
                        ) : status === 'timeout' ? (
                            <AlertCircle className="text-red-500" size={22} />
                        ) : (
                            <QrCode className="text-blue-600" size={22} />
                        )}
                        <h2 className="font-bold text-gray-800">
                            {status === 'confirmed' ? 'Thanh toán thành công!' :
                             status === 'timeout' ? 'Đơn hàng đã hết hạn' :
                             'Quét QR để thanh toán'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 py-5">
                    {/* Confirmed State */}
                    {status === 'confirmed' && (
                        <div className="text-center py-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="text-green-500" size={44} />
                            </div>
                            <p className="text-lg font-semibold text-gray-800 mb-1">Đã xác nhận thanh toán</p>
                            <p className="text-sm text-gray-500">Đơn hàng <span className="font-bold text-gray-700">{orderCode}</span> đã được xác nhận</p>
                            <p className="text-xs text-gray-400 mt-2">Đang chuyển hướng...</p>
                        </div>
                    )}

                    {/* Timeout State */}
                    {status === 'timeout' && (
                        <div className="text-center py-6">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="text-red-400" size={44} />
                            </div>
                            <p className="text-lg font-semibold text-gray-800 mb-1">Hết thời gian thanh toán</p>
                            <p className="text-sm text-gray-500 mb-4">Đơn hàng <span className="font-bold">{orderCode}</span> đã bị hủy tự động</p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-gray-800 text-white text-sm font-semibold rounded-full hover:bg-gray-700 transition"
                            >
                                Đóng
                            </button>
                        </div>
                    )}

                    {/* Waiting State */}
                    {status === 'waiting' && (
                        <>
                            {/* Countdown */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs text-gray-500">Mã đơn hàng: <strong className="text-gray-700">{orderCode}</strong></span>
                                <div className={`flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full ${
                                    remaining < 300 ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'
                                }`}>
                                    <Clock size={14} />
                                    <span>{formatTime(remaining)}</span>
                                </div>
                            </div>

                            {/* QR Code */}
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-white border-2 border-gray-100 rounded-xl shadow-sm">
                                    <img
                                        src={qrUrl}
                                        alt="VietQR Payment Code"
                                        className="w-52 h-52 object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://img.vietqr.io/image/${BANK_NAME}-${BANK_ACCOUNT}-compact.png?amount=${total}&addInfo=${orderCode}&accountName=LILI+FASHION`;
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Bank Info */}
                            <div className="space-y-2.5 bg-gray-50 rounded-xl p-4 text-sm mb-4">
                                <InfoRow
                                    label="Ngân hàng"
                                    value="BIDV (Tài khoản ảo)"
                                    onCopy={() => copyToClipboard('BIDV', 'bank')}
                                    copied={copied === 'bank'}
                                />
                                <InfoRow
                                    label="Số tài khoản"
                                    value={BANK_ACCOUNT}
                                    onCopy={() => copyToClipboard(BANK_ACCOUNT, 'account')}
                                    copied={copied === 'account'}
                                />
                                <InfoRow
                                    label="Số tiền"
                                    value={formatPrice(total)}
                                    onCopy={() => copyToClipboard(String(total), 'amount')}
                                    copied={copied === 'amount'}
                                    highlight
                                />
                                <InfoRow
                                    label="Nội dung CK"
                                    value={orderCode}
                                    onCopy={() => copyToClipboard(orderCode, 'code')}
                                    copied={copied === 'code'}
                                    highlight
                                />
                            </div>

                            {/* Polling indicator */}
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                Đang chờ xác nhận thanh toán...
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({
    label,
    value,
    onCopy,
    copied,
    highlight = false,
}: {
    label: string;
    value: string;
    onCopy: () => void;
    copied: boolean;
    highlight?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="text-gray-500 shrink-0">{label}:</span>
            <div className="flex items-center gap-1.5 min-w-0">
                <span className={`font-medium truncate ${highlight ? 'text-blue-700' : 'text-gray-700'}`}>{value}</span>
                <button
                    onClick={onCopy}
                    title="Sao chép"
                    className="shrink-0 p-1 text-gray-400 hover:text-blue-600 rounded transition"
                >
                    {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
            </div>
        </div>
    );
}
