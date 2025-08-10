import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 获取最活跃用户数据
    const activeUsers = await prisma.cardExchange.groupBy({
      by: ['actionInitiatorAccount'],
      where: {
        actionInitiatorAccount: {
          not: null,
          not: ''
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 20 // 获取前20名
    });

    // 为每个用户计算详细统计
    const detailedUsers = await Promise.all(
      activeUsers.map(async (user) => {
        const userStats = await prisma.cardExchange.findMany({
          where: {
            actionInitiatorAccount: user.actionInitiatorAccount
          },
          select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
        });

        const totalExchanges = userStats.length;
        const successfulExchanges = userStats.filter(exchange => 
          exchange.status === 'claimed'
        ).length;
        const successRate = totalExchanges > 0 ? (successfulExchanges / totalExchanges) * 100 : 0;
        
        // 计算活跃天数
        const dates = userStats.map(exchange => 
          new Date(exchange.createdAt).toDateString()
        );
        const uniqueDates = new Set(dates);
        const activeDays = uniqueDates.size;

        return {
          battleTag: user.actionInitiatorAccount,
          totalExchanges,
          successfulExchanges,
          successRate,
          activeDays
        };
      })
    );

    // 按总交换次数排序
    detailedUsers.sort((a, b) => b.totalExchanges - a.totalExchanges);

    return NextResponse.json(detailedUsers);
  } catch (error) {
    console.error('Error fetching active users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active users data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}