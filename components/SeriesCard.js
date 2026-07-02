'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';

const DEFAULT_COVER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%231a1a2e'/%3E%3Crect x='1' y='1' width='298' height='448' fill='none' stroke='%23333' stroke-width='1'/%3E%3Cpath d='M100 160 L100 290 L150 260 L200 290 L200 160 Z' fill='none' stroke='%23444' stroke-width='2'/%3E%3Ccircle cx='150' cy='140' r='20' fill='none' stroke='%23444' stroke-width='2'/%3E%3Ctext x='150' y='330' text-anchor='middle' fill='%23555' font-family='sans-serif' font-size='13'%3EKapak Yok%3C/text%3E%3C/svg%3E";

const STATUS_TR = {
    'ongoing': 'Devam',
    'completed': 'Tamamlandı',
    'hiatus': 'Ara Verildi',
    'cancelled': 'İptal',
    'current': 'Güncel'
};

const TYPE_LABEL = {
    'manga': 'Manga',
    'manhwa': 'Manhwa',
    'manhua': 'Manhua',
    'comic': 'Çizgi Roman',
};

const TYPE_COLOR = {
    'manga':   { bg: 'rgba(99,102,241,0.85)',  border: 'rgba(129,140,248,0.5)' },
    'manhwa':  { bg: 'rgba(16,185,129,0.85)',  border: 'rgba(52,211,153,0.5)' },
    'manhua':  { bg: 'rgba(245,158,11,0.85)',  border: 'rgba(252,211,77,0.5)' },
    'comic':   { bg: 'rgba(239,68,68,0.85)',   border: 'rgba(248,113,113,0.5)' },
};

const STATUS_COLOR = {
    'ongoing':   { bg: 'rgba(22,163,74,0.85)',   border: 'rgba(74,222,128,0.4)' },
    'completed': { bg: 'rgba(99,102,241,0.85)',  border: 'rgba(129,140,248,0.4)' },
    'hiatus':    { bg: 'rgba(217,119,6,0.85)',   border: 'rgba(252,211,77,0.4)' },
    'cancelled': { bg: 'rgba(220,38,38,0.85)',   border: 'rgba(248,113,113,0.4)' },
    'current':   { bg: 'rgba(8,145,178,0.85)',   border: 'rgba(34,211,238,0.4)' },
};

const GENRE_TR = {
    'Action': 'Aksiyon', 'Adventure': 'Macera', 'Comedy': 'Komedi', 'Drama': 'Drama',
    'Fantasy': 'Fantastik', 'Historical': 'Tarihi', 'Horror': 'Korku', 'Isekai': 'Isekai',
    'Martial Arts': 'Dövüş Sanatları', 'Mystery': 'Gizem', 'Reincarnation': 'Reenkarnasyon',
    'Romance': 'Romantik', 'School': 'Okul', 'Sci-Fi': 'Bilim Kurgu',
    'Supernatural': 'Doğaüstü', 'Thriller': 'Gerilim', 'Ecchi': 'Ecchi', 'Harem': 'Harem',
    'Josei': 'Josei', 'Mature': 'Yetişkin', 'Mecha': 'Mecha', 'Psychological': 'Psikolojik',
    'Seinen': 'Seinen', 'Shoujo': 'Shoujo', 'Shounen': 'Shounen', 'Slice of Life': 'Günlük Yaşam',
    'Sports': 'Spor', 'Tragedy': 'Trajedi', 'Webtoon': 'Webtoon', 'Manhwa': 'Manhwa', 'Manhua': 'Manhua'
};

export default function SeriesCard({ series, priority = false }) {
    const { user } = useAuth();
    const [showGuestAlert, setShowGuestAlert] = useState(false);

    const genres = (() => {
        try {
            if (Array.isArray(series.genres)) return series.genres;
            return JSON.parse(series.genres || '[]');
        } catch { return []; }
    })();

    const isAdult = !!series.is_adult;
    const isBlurred = isAdult && !user;
    const chapterCount = series.chapterCount ?? series.chapter_count ?? null;
    const typeKey = (series.type || '').toLowerCase();
    const typeLabel = TYPE_LABEL[typeKey];
    const typeStyle = TYPE_COLOR[typeKey] || { bg: 'rgba(80,80,100,0.85)', border: 'rgba(150,150,180,0.4)' };
    const statusKey = series.status || '';
    const statusStyle = STATUS_COLOR[statusKey] || { bg: 'rgba(80,80,100,0.85)', border: 'rgba(150,150,180,0.4)' };

    const rating = series.rating != null ? series.rating : null;

    const badgeBase = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 6,
        fontSize: '0.65rem',
        fontWeight: 800,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        lineHeight: 1,
        whiteSpace: 'nowrap',
    };

    if (isBlurred) {
        return (
            <div
                className="sc2-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowGuestAlert(v => !v)}
            >
                <div className="sc2-img-wrap">
                    <Image
                        src={series.cover_url || DEFAULT_COVER}
                        alt="18+ İçerik"
                        fill
                        loading="lazy"
                        sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1200px) 25vw, 200px"
                        style={{ filter: 'blur(14px)', transform: 'scale(1.05)' }}
                    />
                    {/* badges */}
                    <div className="sc2-badges-top">
                        <span style={{ ...badgeBase, background: 'rgba(239,68,68,0.85)', border: '1px solid rgba(248,113,113,0.5)', color: '#fff' }}>18+</span>
                    </div>
                    {/* lock overlay */}
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 4,
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Giriş Yapın</span>
                    </div>
                </div>
                {/* Info block below image */}
                <div className="sc2-body">
                    <div className="sc2-title" style={{ filter: 'blur(5px)', userSelect: 'none' }}>{series.title}</div>
                </div>
                {showGuestAlert && (
                    <div className="adult-guest-alert" onClick={e => e.stopPropagation()}>
                        <p>Bu içerik yalnızca kayıtlı üyelere özeldir.</p>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                            <a href="/login" className="adult-alert-btn adult-alert-btn-primary">Giriş Yap</a>
                            <a href="/register" className="adult-alert-btn adult-alert-btn-outline">Kayıt Ol</a>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link href={`/seri/${series.slug || series.id}`} className="sc2-card">
            <div className="sc2-img-wrap">
                <Image
                    src={series.cover_url || DEFAULT_COVER}
                    alt={series.title}
                    fill
                    loading={priority ? 'eager' : 'lazy'}
                    priority={priority}
                    sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1200px) 25vw, 200px"
                    className="sc2-img"
                />
                {/* Top badges */}
                <div className="sc2-badges-top">
                    {typeLabel && (
                        <span style={{ ...badgeBase, background: typeStyle.bg, border: `1px solid ${typeStyle.border}`, color: '#fff' }}>
                            {typeLabel}
                        </span>
                    )}
                    {isAdult && (
                        <span style={{ ...badgeBase, background: 'rgba(239,68,68,0.85)', border: '1px solid rgba(248,113,113,0.5)', color: '#fff' }}>18+</span>
                    )}
                </div>

                {/* Status badge top-right */}
                {statusKey && (
                    <div className="sc2-badge-status">
                        <span style={{ ...badgeBase, background: statusStyle.bg, border: `1px solid ${statusStyle.border}`, color: '#fff' }}>
                            {STATUS_TR[statusKey] || statusKey}
                        </span>
                    </div>
                )}
            </div>

            {/* Info block BELOW the image */}
            <div className="sc2-body">
                {rating !== null && (
                    <div className="sc2-rating">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        {rating.toFixed(1)}
                    </div>
                )}
                <div className="sc2-title">{series.title}</div>
                <div className="sc2-meta">
                    {chapterCount !== null && (
                        <span className="sc2-chapters">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                            </svg>
                            {chapterCount > 0 ? `${chapterCount} Bölüm` : 'Bölüm Yok'}
                        </span>
                    )}
                    {genres.length > 0 && (
                        <span className="sc2-genre-pill">{GENRE_TR[genres[0]] || genres[0]}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}