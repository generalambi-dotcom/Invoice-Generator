import React from 'react';

interface ImageUploadProps {
    label: string;
    currentImage?: string;
    onImageUpload: (url: string) => void;
}

export default function ImageUpload({
    label,
    currentImage,
    onImageUpload,
}: ImageUploadProps) {
    return (
        <div className="flex flex-col items-center gap-4 group">
            {currentImage ? (
                <div className="relative">
                    <img src={currentImage} alt="Logo" className="h-20 object-contain rounded-lg border border-gray-100 p-1" />
                    {/* The remove button is handled by parent, but we can add overlay to change */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                        <span className="text-white text-xs font-medium">Change</span>
                    </div>
                </div>
            ) : (
                <div className="h-20 w-full min-w-[120px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-theme-primary hover:text-theme-primary transition-colors cursor-pointer">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-xs font-semibold">{label}</span>
                </div>
            )}

            <label className="absolute inset-0 cursor-pointer opacity-0">
                <span className="sr-only">{label}</span>
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                onImageUpload(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                        }
                    }}
                />
            </label>
        </div>
    );
}
