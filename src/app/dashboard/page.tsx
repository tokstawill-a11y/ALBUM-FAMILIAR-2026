import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DashboardClient from '@/components/DashboardClient';

export default async function DashboardPage() {
  const session = await auth();

  const [albums, recentMedia, familyMembers, totalPhotosCount, totalVideosCount] = await Promise.all([
    prisma.album.findMany({
      where: { familyId: session?.user?.familyId as string },
      include: {
        createdBy: true,
        _count: { select: { media: true } },
        media: { take: 1, orderBy: { createdAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.media.findMany({
      where: { album: { familyId: session?.user?.familyId as string } },
      include: {
        uploadedBy: true,
        album: true,
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    }),
    prisma.user.findMany({
      where: { familyId: session?.user?.familyId as string },
      select: { id: true, name: true, image: true, _count: { select: { uploadedMedia: true } } }
    }),
    prisma.media.count({
      where: { album: { familyId: session?.user?.familyId as string }, type: 'IMAGE' }
    }),
    prisma.media.count({
      where: { album: { familyId: session?.user?.familyId as string }, type: 'VIDEO' }
    })
  ]);

  return (
    <DashboardClient
      albums={albums as any}
      recentMedia={recentMedia as any}
      familyMembers={familyMembers as any}
      totalPhotos={totalPhotosCount}
      totalVideos={totalVideosCount}
      currentUserId={session?.user?.id ?? ''}
      currentUserName={session?.user?.name ?? ''}
      familyId={session?.user?.familyId ?? ''}
    />
  );
}


