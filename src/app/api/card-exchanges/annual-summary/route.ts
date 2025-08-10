import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 获取集卡市场年终总结数据
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIp = searchParams.get('userIp');
    
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // 1. 交换活动总览
    const totalCardExchanges = await prisma.cardExchange.count();
    
    // 活跃用户数（基于IP去重）
    const activeUsersResult = await prisma.cardExchange.groupBy({
      by: ['creatorIp'],
      _count: {
        id: true
      }
    });
    const activeUsers = activeUsersResult.length;

    // 成功交换数量
    const successfulExchanges = await prisma.cardExchange.count({
      where: {
        status: 'claimed'
      }
    });

    // 当前活跃交换
    const activeExchanges = await prisma.cardExchange.count({
      where: {
        status: 'active'
      }
    });

    const successRate = totalCardExchanges > 0 ? (successfulExchanges / totalCardExchanges) * 100 : 0;

    // 2. 交换模式分析
    const exchangeModes = await prisma.cardExchange.groupBy({
      by: ['actionType'],
      _count: {
        id: true
      }
    });

    const askCount = exchangeModes.find(mode => mode.actionType === 'ask')?._count.id || 0;
    const exchangeCount = exchangeModes.find(mode => mode.actionType === 'exchange')?._count.id || 0;
    const giveCount = exchangeModes.find(mode => mode.actionType === 'give')?._count.id || 0;

    const askPercentage = totalCardExchanges > 0 ? (askCount / totalCardExchanges) * 100 : 0;
    const exchangePercentage = totalCardExchanges > 0 ? (exchangeCount / totalCardExchanges) * 100 : 0;
    const givePercentage = totalCardExchanges > 0 ? (giveCount / totalCardExchanges) * 100 : 0;

    // 3. 卡片热度排行
    // 最受欢迎的求卡（基于actionInitiatorCardId）
    const mostRequestedCards = await prisma.cardExchange.groupBy({
      by: ['actionInitiatorCardId'],
      where: {
        actionType: 'ask',
        actionInitiatorCardId: {
          not: 0
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
      take: 10
    });

    // 最热门的交换卡片（基于actionAcceptCardId）
    const mostExchangedCards = await prisma.cardExchange.groupBy({
      by: ['actionAcceptCardId'],
      where: {
        actionAcceptCardId: {
          not: 0
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
      take: 10
    });

    // 4. 时间维度分析
    // 获取最近30天的每日统计
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyStats: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = await prisma.cardExchange.count({
        where: {
          createdAt: {
            gte: new Date(dateStr),
            lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });
      
      dailyStats[dateStr] = count;
    }

    // 平均存活时间（从创建到被领取的平均时长，以小时为单位）
    const claimedExchanges = await prisma.cardExchange.findMany({
      where: {
        status: 'claimed'
      },
      select: {
        createdAt: true,
        lastCheckedAt: true
      }
    });

    let totalLifespanHours = 0;
    claimedExchanges.forEach(exchange => {
      if (exchange.lastCheckedAt) {
        const lifespanMs = new Date(exchange.lastCheckedAt).getTime() - new Date(exchange.createdAt).getTime();
        totalLifespanHours += lifespanMs / (1000 * 60 * 60);
      }
    });
    
    const averageLifespan = claimedExchanges.length > 0 ? totalLifespanHours / claimedExchanges.length : 0;

    // 最快成交记录
    let fastestExchange = 0;
    if (claimedExchanges.length > 0) {
      const fastestMs = Math.min(...claimedExchanges.map(exchange => {
        if (exchange.lastCheckedAt) {
          return new Date(exchange.lastCheckedAt).getTime() - new Date(exchange.createdAt).getTime();
        }
        return Infinity;
      }).filter(ms => ms !== Infinity));
      
      if (fastestMs !== Infinity) {
        fastestExchange = fastestMs / (1000 * 60 * 60);
      }
    }

    // 最久活跃卡片
    const oldestActiveCard = await prisma.cardExchange.findFirst({
      where: {
        status: 'active'
      },
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        actionInitiatorCardId: true,
        createdAt: true
      }
    });

    let oldestActiveCardData = null;
    if (oldestActiveCard) {
      const daysActive = Math.floor((now.getTime() - new Date(oldestActiveCard.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      oldestActiveCardData = {
        cardId: oldestActiveCard.actionInitiatorCardId,
        daysActive
      };
    }

    // 5. 赛区分布统计（修正卡片ID映射）
    const allCards = await prisma.cardExchange.findMany({
      select: {
        actionInitiatorCardId: true,
        actionAcceptCardId: true
      }
    });

    const regionStats = {
      CN: 0,
      APAC: 0,
      EMEA: 0,
      NA: 0
    };

    allCards.forEach(card => {
      // 统计发起卡片的赛区（修正映射）
      if (card.actionInitiatorCardId >= 1 && card.actionInitiatorCardId <= 9) {
        regionStats.CN++;
      } else if (card.actionInitiatorCardId >= 10 && card.actionInitiatorCardId <= 15) {
        regionStats.NA++;
      } else if (card.actionInitiatorCardId >= 16 && card.actionInitiatorCardId <= 21) {
        regionStats.APAC++;
      } else if (card.actionInitiatorCardId >= 22 && card.actionInitiatorCardId <= 27) {
        regionStats.EMEA++;
      }

      // 统计接受卡片的赛区（修正映射）
      if (card.actionAcceptCardId >= 1 && card.actionAcceptCardId <= 9) {
        regionStats.CN++;
      } else if (card.actionAcceptCardId >= 10 && card.actionAcceptCardId <= 15) {
        regionStats.NA++;
      } else if (card.actionAcceptCardId >= 16 && card.actionAcceptCardId <= 21) {
        regionStats.APAC++;
      } else if (card.actionAcceptCardId >= 22 && card.actionAcceptCardId <= 27) {
        regionStats.EMEA++;
      }
    });

    // 6. 社区互助指数
    const communityIndex = {
      giveCount,
      exchangeActivity: exchangeCount,
      askSuccessRate: askCount > 0 ? (await prisma.cardExchange.count({
        where: {
          actionType: 'ask',
          status: 'claimed'
        }
      }) / askCount) * 100 : 0
    };

    // 7. 个人数据统计（如果提供了userIp）
    let personalStats = null;
    if (userIp) {
      const userExchanges = await prisma.cardExchange.findMany({
        where: {
          creatorIp: userIp
        },
        select: {
          id: true,
          actionType: true,
          actionInitiatorCardId: true,
          actionAcceptCardId: true,
          status: true,
          createdAt: true,
          lastCheckedAt: true
        }
      });

      const userTotalExchanges = userExchanges.length;
      const userSuccessfulExchanges = userExchanges.filter(ex => ex.status === 'claimed').length;
      const userSuccessRate = userTotalExchanges > 0 ? (userSuccessfulExchanges / userTotalExchanges) * 100 : 0;

      // 用户交换模式偏好
      const userModeStats = {
        ask: userExchanges.filter(ex => ex.actionType === 'ask').length,
        exchange: userExchanges.filter(ex => ex.actionType === 'exchange').length,
        give: userExchanges.filter(ex => ex.actionType === 'give').length
      };

      // 用户最受欢迎的卡片（最快被领取的）
      const userClaimedExchanges = userExchanges.filter(ex => ex.status === 'claimed' && ex.lastCheckedAt);
      let fastestUserExchange = null;
      if (userClaimedExchanges.length > 0) {
        const fastest = userClaimedExchanges.reduce((prev, current) => {
          const prevTime = new Date(prev.lastCheckedAt!).getTime() - new Date(prev.createdAt).getTime();
          const currentTime = new Date(current.lastCheckedAt!).getTime() - new Date(current.createdAt).getTime();
          return currentTime < prevTime ? current : prev;
        });
        fastestUserExchange = {
          cardId: fastest.actionInitiatorCardId,
          timeToComplete: (new Date(fastest.lastCheckedAt!).getTime() - new Date(fastest.createdAt).getTime()) / (1000 * 60 * 60)
        };
      }

      // 参与时长
      let participationDays = 0;
      let userFirstExchange = null;
      let userLastExchange = null;
      
      if (userExchanges.length > 0) {
        userFirstExchange = userExchanges.reduce((earliest, current) => 
          new Date(current.createdAt) < new Date(earliest.createdAt) ? current : earliest
        );
        userLastExchange = userExchanges.reduce((latest, current) => 
          new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
        );
        
        participationDays = userExchanges.length > 1 ? 
          Math.ceil((new Date(userLastExchange.createdAt).getTime() - new Date(userFirstExchange.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      }

      personalStats = {
        totalExchanges: userTotalExchanges,
        successfulExchanges: userSuccessfulExchanges,
        successRate: userSuccessRate,
        modePreferences: userModeStats,
        fastestExchange: fastestUserExchange,
        participationDays,
        firstExchangeDate: userFirstExchange?.createdAt || null,
        lastExchangeDate: userLastExchange?.createdAt || null
      };
    }

    return NextResponse.json({
      overview: {
        totalCardExchanges,
        activeUsers,
        successfulExchanges,
        activeExchanges,
        successRate
      },
      exchangeModes: {
        ask: askCount,
        exchange: exchangeCount,
        give: giveCount,
        askPercentage,
        exchangePercentage,
        givePercentage
      },
      popularCards: {
        mostRequestedCards: mostRequestedCards.map(card => ({
          cardId: card.actionInitiatorCardId,
          count: card._count?.id || 0
        })),
        mostExchangedCards: mostExchangedCards.map(card => ({
          cardId: card.actionAcceptCardId,
          count: card._count?.id || 0
        }))
      },
      timeAnalysis: {
        dailyStats,
        averageLifespan,
        fastestExchange,
        oldestActiveCard: oldestActiveCardData
      },
      regionStats,
      communityIndex,
      personalStats,
      lastUpdated: now.toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching annual summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annual summary data' },
      { status: 500 }
    );
  }
}