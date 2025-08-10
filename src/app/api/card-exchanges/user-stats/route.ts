import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const battleTag = searchParams.get('battleTag');

    if (!battleTag) {
      return NextResponse.json(
        { error: '请提供战网ID' },
        { status: 400 }
      );
    }

    // 查询用户的所有交换记录
    const userExchanges = await prisma.cardExchange.findMany({
      where: {
        actionInitiatorAccount: battleTag
      },
      select: {
        id: true,
        actionType: true,
        actionInitiatorCardId: true,
        actionAcceptCardId: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (userExchanges.length === 0) {
      return NextResponse.json(
        { error: '未找到该战网用户数据' },
        { status: 404 }
      );
    }

    // 计算统计数据
    const totalExchanges = userExchanges.length;
    const successfulExchanges = userExchanges.filter(exchange => 
      exchange.status === 'claimed'
    ).length;
    const successRate = totalExchanges > 0 ? (successfulExchanges / totalExchanges) * 100 : 0;

    // 计算模式偏好
    const modePreferences = {
      ask: userExchanges.filter(e => e.actionType === 'ask').length,
      exchange: userExchanges.filter(e => e.actionType === 'exchange').length,
      give: userExchanges.filter(e => e.actionType === 'give').length
    };

    // 计算活跃天数
    const dates = userExchanges.map(exchange => 
      new Date(exchange.createdAt).toDateString()
    );
    const uniqueDates = new Set(dates);
    const activeDays = uniqueDates.size;

    // 获取所有用户的排名
    const allUsers = await prisma.cardExchange.groupBy({
      by: ['actionInitiatorAccount'],
      where: {
        actionInitiatorAccount: {
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
      }
    });

    // 找到当前用户的排名
    const userRank = allUsers.findIndex(user => 
      user.actionInitiatorAccount === battleTag
    ) + 1;

    // 统计用户最常交换的卡片
    const cardStats: Record<number, number> = {};
    userExchanges.forEach(exchange => {
      if (exchange.actionInitiatorCardId && exchange.actionInitiatorCardId !== 0) {
        cardStats[exchange.actionInitiatorCardId] = (cardStats[exchange.actionInitiatorCardId] || 0) + 1;
      }
      if (exchange.actionAcceptCardId && exchange.actionAcceptCardId !== 0) {
        cardStats[exchange.actionAcceptCardId] = (cardStats[exchange.actionAcceptCardId] || 0) + 1;
      }
    });

    // 获取最常用的前3张卡片
    const favoriteCards = Object.entries(cardStats)
      .map(([cardId, count]) => ({ cardId: parseInt(cardId), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // 获取最快完成的交换（如果有的话）
    const claimedExchanges = userExchanges.filter(ex => ex.status === 'claimed');
    let fastestExchange = null;
    if (claimedExchanges.length > 0) {
      const fastest = claimedExchanges.reduce((prev, current) => {
        const prevTime = new Date(prev.updatedAt).getTime() - new Date(prev.createdAt).getTime();
        const currentTime = new Date(current.updatedAt).getTime() - new Date(current.createdAt).getTime();
        return currentTime < prevTime ? current : prev;
      });
      fastestExchange = {
        cardId: fastest.actionInitiatorCardId,
        timeToComplete: (new Date(fastest.updatedAt).getTime() - new Date(fastest.createdAt).getTime()) / (1000 * 60 * 60)
      };
    }

    const result = {
      battleTag,
      totalExchanges,
      successfulExchanges,
      successRate,
      modePreferences,
      activeDays,
      rank: userRank > 0 ? userRank : null,
      firstExchange: userExchanges[userExchanges.length - 1]?.createdAt,
      lastExchange: userExchanges[0]?.createdAt,
      favoriteCards,
      fastestExchange
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: '查询失败，请稍后重试' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}