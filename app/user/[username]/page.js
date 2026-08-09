'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSettings } from '@/components/SettingsProvider';
import { useAuth } from '@/components/AuthProvider';
import SeriesCard from '@/components/SeriesCard';

const READING_STATUS_LABELS = {
    reading: 'Okuyor',
    completed: 'Tamamladı',
    plan: 'Planlanan',
    dropped: 'Bırakıldı',
};

const BADGE_ICON_SVG = {
    book:  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    chat:  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    heart: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    sun:   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    star:  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    crown: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 19h20l-2-10-5 5-3-8-3 8-5-5L2 19z"/><rect x="2" y="20" width="20" height="2" rx="1"/></svg>,
    check: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    moon:  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    coin:  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v1m0 8v1M9.07 9.07A3 3 0 0 1 12 8a3 3 0 0 1 3 3c0 1.5-1 2.5-3 3s-3 1.5-3 3a3 3 0 0 0 3 3 3 3 0 0 0 2.93-2"/></svg>,
};

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const username = params.username;
    const { settings: siteSettings } = useSettings() || {};
    const { user: currentUser, loading: authLoading } = useAuth();

    const [profile, setProfile] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [readingList, setReadingList] = useState([]);
    const [badges, setBadges] = useState([]);
    const [customBadges, setCustomBadges] = useState([]);
    const [recentComments, setRecentComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('library');
    const [libraryView, setLibraryView] = useState('favorites');

    const pointsName = siteSettings?.points_name || 'Yomi Puanı';

    useEffect(() => {
        if (!username) return;

        async function fetchProfile() {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`/api/users/${encodeURIComponent(username)}`);
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || 'Profil yüklenemedi');
                    setLoading(false);
                    return;
                }

                setProfile(data.user);
                setFavorites(data.favorites || []);
                setReadingList(data.readingList || []);
                setBadges(data.badges || []);
                setCustomBadges(data.customBadges || []);
                setRecentComments(data.recentComments || []);
                setLoading(false);
            } catch {
                setError('Profil yüklenemedi');
                setLoading(false);
            }
        }

        fetchProfile();
    }, [username]);

    // Redirect to own profile if viewing own profile
    useEffect(() => {
        if (!authLoading && profile && currentUser) {
            if (currentUser.username === username || currentUser.username === profile.username) {
                router.replace('/profile');
            }
        }
    }, [profile, currentUser, authLoading, username, router]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ marginBottom: '20px' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
                <h2 style={{ marginBottom: '12px' }}>{error}</h2>
                <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                    Ana sayfaya dön
                </Link>
            </div>
        );
    }

    if (!profile) return null;

    const rankColors = {
        'user': '#9ca3af',
        'team_member': '#3b82f6',
        'moderator': '#8b5cf6',
        'manager': '#f59e0b',
        'admin': '#ef4444',
    };
    const roleLabels = {
        'user': 'Üye',
        'team_member': 'Çevirmen',
        'moderator': 'Moderatör',
        'manager': 'Yönetici',
        'admin': 'Admin',
    };
    const roleColor = rankColors[profile.role] || '#9ca3af';

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Profil Kartı */}
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '40px',
                marginBottom: '40px',
                textAlign: 'center',
            }}>
                {/* Avatar */}
                <div style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    margin: '0 auto 24px',
                    overflow: 'hidden',
                    border: `4px solid ${roleColor}`,
                    boxShadow: `0 0 30px ${roleColor}40`,
                }}>
                    {profile.avatar_url && profile.avatar_url !== '/default-avatar.png' ? (
                        <img
                            src={profile.avatar_url}
                            alt={profile.username}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3.5rem',
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                        }}>
                            {profile.username?.[0]?.toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Kullanıcı Adı */}
                <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', fontWeight: 800 }}>
                    {profile.username}
                </h1>

                {/* Rol */}
                <div style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    background: `${roleColor}20`,
                    border: `1px solid ${roleColor}50`,
                    color: roleColor,
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    marginBottom: '20px',
                }}>
                    {roleLabels[profile.role] || 'Üye'}
                </div>

                {/* İstatistikler */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '40px',
                    marginTop: '20px',
                    flexWrap: 'wrap',
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>
                            {profile.yomi_points || 0}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {pointsName}
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>
                            {profile.favoriteCount || 0}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Favori
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>
                            {profile.commentCount || 0}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Yorum
                        </div>
                    </div>
                </div>

                {/* Katılım Tarihi */}
                <div style={{ marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {profile.created_at && new Date(profile.created_at).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    }) + ' tarihinden beri üye'}
                </div>
            </div>

            {/* Geri Dön Butonu */}
            <div style={{ marginBottom: '24px' }}>
                <Link
                    href="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Ana sayfaya dön
                </Link>
            </div>

            {/* Sekme Navigasyonu */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '24px',
                flexWrap: 'wrap',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: '2px',
            }}>
                {[
                    { id: 'library', label: 'Kütüphane', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg> },
                    { id: 'badges', label: 'Rozetler', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg> },
                    { id: 'comments', label: 'Yorumlar', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 18px',
                            background: activeTab === t.id ? 'var(--bg-card)' : 'transparent',
                            border: 'none',
                            borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                            color: activeTab === t.id ? 'var(--accent)' : 'var(--text-secondary)',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            borderRadius: '8px 8px 0 0',
                        }}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Kütüphane Sekmesi */}
            {activeTab === 'library' && (
                <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setLibraryView('favorites')}
                            style={libraryTabStyle(libraryView === 'favorites')}
                        >
                            Favoriler ({favorites.length})
                        </button>
                        {['reading', 'completed', 'plan', 'dropped'].map(status => (
                            <button
                                key={status}
                                onClick={() => setLibraryView(status)}
                                style={libraryTabStyle(libraryView === status)}
                            >
                                {READING_STATUS_LABELS[status]} ({readingList.filter(i => i.status === status).length})
                            </button>
                        ))}
                    </div>

                    {libraryView === 'favorites' ? (
                        favorites.length === 0 ? (
                            <EmptyState text="Kütüphanede favori seri bulunmuyor." />
                        ) : (
                            <div className="series-grid">
                                {favorites.map(s => <SeriesCard key={s.id} series={s} />)}
                            </div>
                        )
                    ) : (() => {
                        const filtered = readingList.filter(i => i.status === libraryView);
                        if (filtered.length === 0) return <EmptyState text="Bu kategoride seri bulunmuyor." />;
                        return (
                            <div className="series-grid">
                                {filtered.map(item => (
                                    <Link key={item.id} href={`/seri/${item.slug || item.series_id}`} style={{ textDecoration: 'none' }}>
                                        <div style={{ background: 'var(--bg-card)', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <img
                                                src={item.cover_image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect width='300' height='400' fill='%231a1a2e'/%3E%3C/svg%3E"}
                                                alt={item.title}
                                                style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }}
                                            />
                                            <div style={{ padding: '10px 12px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                                                {item.last_read_chapter && (
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Son okunan: Bölüm {item.last_read_chapter}</div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Rozetler Sekmesi */}
            {activeTab === 'badges' && (
                <div>
                    {customBadges.length > 0 && (
                        <div style={{ marginBottom: '28px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Özel Rozetler
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {customBadges.map(b => (
                                    <div key={b.id} style={{
                                        display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                        padding: '14px 18px', borderRadius: 12,
                                        background: `${b.color}14`,
                                        border: `1px solid ${b.color}44`,
                                        minWidth: 90, textAlign: 'center',
                                    }}>
                                        <span style={{ fontSize: '2rem' }}>{b.icon}</span>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: b.color }}>{b.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
                        Başarı Rozetleri {badges.length > 0 && `(${badges.length})`}
                    </h3>
                    {badges.length === 0 ? (
                        <EmptyState text="Henüz kazanılmış bir rozet bulunmuyor." />
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                            gap: '14px',
                        }}>
                            {badges.map(b => (
                                <div key={b.id} title={b.description} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '16px 10px',
                                    borderRadius: '14px',
                                    background: 'var(--bg-card)',
                                    border: `1px solid ${b.color}44`,
                                    textAlign: 'center',
                                }}>
                                    <div style={{ color: b.color }}>
                                        {BADGE_ICON_SVG[b.icon] || <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: b.color }}>{b.name}</div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{b.description}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Yorumlar Sekmesi */}
            {activeTab === 'comments' && (
                <div>
                    {recentComments.length === 0 ? (
                        <EmptyState text="Henüz yorum yapılmamış." />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {recentComments.map(c => (
                                <div key={c.id} style={{
                                    background: 'var(--bg-card)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    padding: '14px 18px',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>
                                            {c.series_title || 'Bilinmeyen Seri'}
                                            {c.chapter_number != null && ` — Bölüm ${c.chapter_number}`}
                                        </span>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                            {new Date(c.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>{c.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function libraryTabStyle(active) {
    return {
        padding: '8px 16px',
        borderRadius: '20px',
        border: active ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
        background: active ? 'rgba(94,114,228,0.15)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        fontWeight: 600,
        fontSize: '0.82rem',
        cursor: 'pointer',
    };
}

function EmptyState({ text }) {
    return (
        <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            color: 'var(--text-muted)',
        }}>
            {text}
        </div>
    );
}
