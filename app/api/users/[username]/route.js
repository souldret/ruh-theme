export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { BADGES } from '@/app/api/users/badges/route';
import { getAllBadges } from '@/lib/badges';

// GET /api/users/[username] — Herkes tarafından görüntülenebilir
// Kullanıcı profil bilgilerini getirir (özet görünüm)
export async function GET(request, { params }) {
    try {
        const { username } = await params;
        if (!username) {
            return NextResponse.json({ error: 'Kullanıcı adı gerekli' }, { status: 400 });
        }

        const db = getDb();

        // Kullanıcıyı bul
        const targetUser = db.prepare(`
            SELECT id, username, avatar_url, role, yomi_points, created_at
            FROM users
            WHERE username = ?
        `).get(username);

        if (!targetUser) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
        }

        // İstatistikler - tek sorguda birleştir
        const stats = db.prepare(`
            SELECT
                (SELECT COUNT(*) FROM favorites WHERE user_id = ?) as favoriteCount,
                (SELECT COUNT(*) FROM comments WHERE user_id = ?) as commentCount,
                (SELECT COUNT(*) FROM user_badges WHERE user_id = ?) as badgeCount
        `).get(targetUser.id, targetUser.id, targetUser.id);

        // En son aktiviteler
        const recentComments = db.prepare(`
            SELECT c.id, c.content, c.created_at, s.title as series_title, ch.chapter_number
            FROM comments c
            LEFT JOIN series s ON c.series_id = s.id
            LEFT JOIN chapters ch ON c.chapter_id = ch.id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
            LIMIT 20
        `).all(targetUser.id);

        // Favoriler (Kütüphane) — favorites/list route'undaki sorgunun aynısı
        const favorites = db.prepare(`
            SELECT
                s.id,
                s.title,
                s.slug,
                s.cover_url,
                s.status,
                s.type,
                s.genres,
                s.rating,
                s.is_adult,
                (SELECT COUNT(*) FROM chapters WHERE series_id = s.id AND (publish_at IS NULL OR publish_at <= datetime('now'))) as chapter_count
            FROM favorites f
            JOIN series s ON s.id = f.series_id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        `).all(targetUser.id);

        // Okuma Listesi (okuyor/tamamladı/planlanan/bırakıldı) — reading-list route'undaki sorgunun aynısı
        const readingList = db.prepare(`
            SELECT rl.id, rl.series_id, rl.status, rl.updated_at,
                   s.title, s.cover_url as cover_image, s.slug, s.type, s.genres,
                   (SELECT COUNT(*) FROM chapters c WHERE c.series_id = s.id) as chapter_count,
                   (SELECT MAX(chapter_number) FROM chapters c WHERE c.series_id = s.id) as latest_chapter,
                   (SELECT chapter_number FROM chapters c2
                    JOIN reading_history rh ON rh.chapter_id = c2.id
                    WHERE c2.series_id = s.id AND rh.user_id = ?
                    ORDER BY c2.chapter_number DESC LIMIT 1) as last_read_chapter
            FROM reading_lists rl
            JOIN series s ON s.id = rl.series_id AND s.published = 1
            WHERE rl.user_id = ?
            ORDER BY rl.updated_at DESC
        `).all(targetUser.id, targetUser.id);

        // Rozetler — kazanılmış olanlar (public görünümde yeni rozet ataması yapılmaz)
        const earnedBadges = db.prepare('SELECT badge_id, earned_at FROM user_badges WHERE user_id = ? ORDER BY earned_at DESC').all(targetUser.id);
        const earnedIds = new Set(earnedBadges.map(b => b.badge_id));
        const earnedMap = Object.fromEntries(earnedBadges.map(b => [b.badge_id, b.earned_at]));

        const badges = BADGES.filter(b => earnedIds.has(b.id))
            .map(b => ({ ...b, earned: true, earned_at: earnedMap[b.id] || null }));

        const customBadges = getAllBadges(db)
            .filter(b => earnedIds.has(b.id))
            .map(b => ({ ...b, earned: true, earned_at: earnedMap[b.id] || null, category: 'custom' }));

        return NextResponse.json({
            success: true,
            user: {
                ...targetUser,
                favoriteCount: stats?.favoriteCount || 0,
                commentCount: stats?.commentCount || 0,
                badgeCount: stats?.badgeCount || 0,
            },
            recentComments,
            favorites,
            readingList,
            badges,
            customBadges,
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ error: 'Profil yüklenemedi' }, { status: 500 });
    }
}
