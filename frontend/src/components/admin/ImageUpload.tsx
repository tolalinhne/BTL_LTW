import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { uploadService } from '@/services/admin/upload.service';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    folder?: string;
    label?: string;
    className?: string;
}

export default function ImageUpload({ value, onChange, folder = 'general', label = 'Ảnh', className = '' }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Chỉ chấp nhận file ảnh');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('File quá lớn (tối đa 10MB)');
            return;
        }

        setError('');
        setIsUploading(true);
        try {
            const result = await uploadService.uploadImage(file, folder);
            onChange(result.url);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi upload ảnh');
        } finally {
            setIsUploading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleRemove = () => {
        onChange('');
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className={className}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}

            {value ? (
                <div className="relative group w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img src={value} alt="Preview" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-100"
                        >
                            Đổi ảnh
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => !isUploading && inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`
                        flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed cursor-pointer transition-all
                        ${dragOver ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'}
                        ${isUploading ? 'pointer-events-none opacity-60' : ''}
                    `}
                >
                    {isUploading ? (
                        <>
                            <Loader2 size={28} className="text-brand-accent animate-spin mb-2" />
                            <p className="text-sm text-gray-500">Đang tải lên...</p>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <ImageIcon size={20} className="text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-600 font-medium">Kéo thả ảnh vào đây</p>
                            <p className="text-xs text-gray-400 mt-1">hoặc click để chọn file (tối đa 10MB)</p>
                        </>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
            />

            {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
        </div>
    );
}
