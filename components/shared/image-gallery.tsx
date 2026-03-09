'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface ImageGalleryProps {
    images: string[];
    alt: string;
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const validImages = (images || []).filter(Boolean);

    const openLightbox = (index: number) => {
        setActiveIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = useCallback(() => setLightboxOpen(false), []);

    const goNext = useCallback(() =>
        setActiveIndex((prev) => (prev + 1) % validImages.length),
        [validImages.length]);

    const goPrev = useCallback(() =>
        setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length),
        [validImages.length]);

    useEffect(() => {
        if (!lightboxOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightboxOpen, closeLightbox, goNext, goPrev]);

    if (validImages.length === 0) {
        return (
            <div className="aspect-[16/9] w-full bg-stone-100 rounded-2xl flex items-center justify-center text-stone-300">
                <ZoomIn className="h-12 w-12 opacity-20" />
            </div>
        );
    }

    // ─── Single image ──────────────────────────────────────────────────────────
    if (validImages.length === 1) {
        return (
            <>
                <div
                    className="aspect-[16/9] w-full bg-stone-200 rounded-2xl overflow-hidden relative group cursor-zoom-in"
                    onClick={() => openLightbox(0)}
                >
                    <img
                        src={validImages[0]}
                        alt={alt}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                    </div>
                </div>
                {lightboxOpen && (
                    <Lightbox
                        images={validImages}
                        activeIndex={activeIndex}
                        setActiveIndex={setActiveIndex}
                        alt={alt}
                        onClose={closeLightbox}
                        onNext={goNext}
                        onPrev={goPrev}
                    />
                )}
            </>
        );
    }

    // ─── Multi-image grid ──────────────────────────────────────────────────────
    const mainImage = validImages[0];
    const sideImages = validImages.slice(1);

    return (
        <>
            <div className="w-full rounded-2xl overflow-hidden">
                {validImages.length === 2 ? (
                    <div className="grid grid-cols-2 gap-1.5 h-64 md:h-[420px]">
                        {validImages.map((img, i) => (
                            <GalleryThumb key={i} src={img} alt={`${alt} ${i + 1}`} onClick={() => openLightbox(i)} />
                        ))}
                    </div>
                ) : validImages.length === 3 ? (
                    <div className="grid grid-cols-2 gap-1.5 h-64 md:h-[420px]">
                        <GalleryThumb src={mainImage} alt={`${alt} 1`} onClick={() => openLightbox(0)} className="row-span-2" />
                        {sideImages.slice(0, 2).map((img, i) => (
                            <GalleryThumb key={i + 1} src={img} alt={`${alt} ${i + 2}`} onClick={() => openLightbox(i + 1)} />
                        ))}
                    </div>
                ) : (
                    // 4-5 images: large left + 2 grid right
                    <div className="grid grid-cols-2 gap-1.5 h-64 md:h-[480px]">
                        <GalleryThumb src={mainImage} alt={`${alt} 1`} onClick={() => openLightbox(0)} className="row-span-2" />
                        <div className="grid grid-rows-2 gap-1.5">
                            {sideImages.slice(0, 2).map((img, i) => (
                                <div key={i + 1} className="relative overflow-hidden rounded-lg">
                                    <GalleryThumb
                                        src={img}
                                        alt={`${alt} ${i + 2}`}
                                        onClick={() => openLightbox(i + 1)}
                                        className="h-full"
                                    />
                                    {/* "See all" overlay on last visible thumb when more photos exist */}
                                    {i === 1 && validImages.length > 4 && (
                                        <button
                                            onClick={() => openLightbox(3)}
                                            className="absolute inset-0 bg-black/50 hover:bg-black/60 transition-colors flex flex-col items-center justify-center text-white font-semibold text-xl rounded-lg"
                                        >
                                            <span>+{validImages.length - 3}</span>
                                            <span className="text-xs font-normal opacity-80 mt-1">more photos</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* See all photos link */}
            <div className="flex justify-end mt-2">
                <button
                    onClick={() => openLightbox(0)}
                    className="text-sm font-medium text-stone-600 hover:text-stone-900 underline underline-offset-2 transition-colors"
                >
                    View all {validImages.length} photos
                </button>
            </div>

            {lightboxOpen && (
                <Lightbox
                    images={validImages}
                    activeIndex={activeIndex}
                    setActiveIndex={setActiveIndex}
                    alt={alt}
                    onClose={closeLightbox}
                    onNext={goNext}
                    onPrev={goPrev}
                />
            )}
        </>
    );
}

// ─── Thumbnail helper ──────────────────────────────────────────────────────────
function GalleryThumb({
    src,
    alt,
    onClick,
    className = '',
}: {
    src: string;
    alt: string;
    onClick: () => void;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative overflow-hidden rounded-lg group cursor-zoom-in w-full ${className}`}
        >
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </button>
    );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({
    images,
    activeIndex,
    setActiveIndex,
    alt,
    onClose,
    onNext,
    onPrev,
}: {
    images: string[];
    activeIndex: number;
    setActiveIndex: (i: number) => void;
    alt: string;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 bg-black/92 backdrop-blur-sm flex items-center justify-center"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
                aria-label="Close gallery"
            >
                <X className="h-6 w-6" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm select-none">
                {activeIndex + 1} / {images.length}
            </div>

            {/* Prev */}
            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
                    aria-label="Previous"
                >
                    <ChevronLeft className="h-7 w-7" />
                </button>
            )}

            {/* Main image */}
            <div
                className="max-w-5xl w-full px-16 md:px-20 flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
                style={{ maxHeight: images.length > 1 ? 'calc(100vh - 120px)' : '90vh' }}
            >
                <img
                    src={images[activeIndex]}
                    alt={`${alt} – photo ${activeIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl select-none"
                    style={{ maxHeight: images.length > 1 ? 'calc(100vh - 160px)' : '90vh' }}
                    draggable={false}
                />
            </div>

            {/* Next */}
            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
                    aria-label="Next"
                >
                    <ChevronRight className="h-7 w-7" />
                </button>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div
                    className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            className={`h-12 w-12 md:h-14 md:w-14 rounded-lg overflow-hidden border-2 transition-all duration-200 shrink-0 ${i === activeIndex
                                    ? 'border-white scale-110 shadow-lg'
                                    : 'border-white/30 opacity-50 hover:opacity-80 hover:border-white/60'
                                }`}
                            aria-label={`View photo ${i + 1}`}
                        >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
