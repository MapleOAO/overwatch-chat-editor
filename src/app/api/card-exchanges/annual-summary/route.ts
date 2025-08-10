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

    // 4. 时间维度分析（优化查询，避免大量数据处理）
    // 获取最近30天的每日统计 - 使用原生SQL聚合查询
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyStats: Record<string, number> = {};
    
    // 使用原生SQL进行日期聚合，避免多次查询
    const dailyStatsResult = await prisma.$queryRaw`
      SELECT DATE(createdAt) as date, COUNT(*) as count 
      FROM card_exchanges 
      WHERE createdAt >= ${thirtyDaysAgo}
      GROUP BY DATE(createdAt)
      ORDER BY date
    ` as Array<{date: Date, count: bigint}>;
    
    dailyStatsResult.forEach(row => {
      const dateStr = row.date.toISOString().split('T')[0];
      dailyStats[dateStr] = Number(row.count);
    });

    // 平均存活时间（使用聚合查询优化）
    const avgLifespanResult = await prisma.$queryRaw`
      SELECT AVG(TIMESTAMPDIFF(HOUR, createdAt, lastCheckedAt)) as avgHours
      FROM card_exchanges 
      WHERE status = 'claimed' AND lastCheckedAt IS NOT NULL
    ` as Array<{avgHours: number | null}>;
    
    const averageLifespanHours = Number(avgLifespanResult[0]?.avgHours) || 0;

    // 最快成交记录（使用聚合查询优化）
    const fastestResult = await prisma.$queryRaw`
      SELECT MIN(TIMESTAMPDIFF(HOUR, createdAt, lastCheckedAt)) as fastestHours
      FROM card_exchanges 
      WHERE status = 'claimed' AND lastCheckedAt IS NOT NULL
    ` as Array<{fastestHours: number | null}>;
    
    const fastestExchange = Number(fastestResult[0]?.fastestHours) || 0;

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

    // 5. 赛区分布统计（优化查询，避免内存溢出）
    const regionStats = {
      CN: 0,
      APAC: 0,
      EMEA: 0,
      NA: 0
    };

    // 分别统计发起卡片的赛区分布
    const initiatorRegionCounts = await Promise.all([
      prisma.cardExchange.count({ where: { actionInitiatorCardId: { gte: 1, lte: 9 } } }),
      prisma.cardExchange.count({ where: { actionInitiatorCardId: { gte: 10, lte: 15 } } }),
      prisma.cardExchange.count({ where: { actionInitiatorCardId: { gte: 16, lte: 21 } } }),
      prisma.cardExchange.count({ where: { actionInitiatorCardId: { gte: 22, lte: 27 } } })
    ]);

    // 分别统计接受卡片的赛区分布
    const acceptorRegionCounts = await Promise.all([
      prisma.cardExchange.count({ where: { actionAcceptCardId: { gte: 1, lte: 9 } } }),
      prisma.cardExchange.count({ where: { actionAcceptCardId: { gte: 10, lte: 15 } } }),
      prisma.cardExchange.count({ where: { actionAcceptCardId: { gte: 16, lte: 21 } } }),
      prisma.cardExchange.count({ where: { actionAcceptCardId: { gte: 22, lte: 27 } } })
    ]);

    regionStats.CN = initiatorRegionCounts[0] + acceptorRegionCounts[0];
    regionStats.NA = initiatorRegionCounts[1] + acceptorRegionCounts[1];
    regionStats.APAC = initiatorRegionCounts[2] + acceptorRegionCounts[2];
    regionStats.EMEA = initiatorRegionCounts[3] + acceptorRegionCounts[3];

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
        },
        take: 1000 // 限制最多1000条记录，防止内存溢出
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

      // 用户最快交换（使用聚合查询优化）
      const userFastestResult = await prisma.$queryRaw`
        SELECT actionInitiatorCardId, MIN(TIMESTAMPDIFF(HOUR, createdAt, lastCheckedAt)) as fastestHours
        FROM card_exchanges 
        WHERE creatorIp = ${userIp} AND status = 'claimed' AND lastCheckedAt IS NOT NULL
        GROUP BY actionInitiatorCardId
        ORDER BY fastestHours ASC
        LIMIT 1
      ` as Array<{actionInitiatorCardId: number, fastestHours: number}>;
      
      let fastestUserExchange = null;
      if (userFastestResult.length > 0) {
        fastestUserExchange = {
          cardId: userFastestResult[0].actionInitiatorCardId,
          timeToComplete: Number(userFastestResult[0].fastestHours) || 0
        };
      }

      // 参与时长（使用聚合查询优化）
      const userTimeRangeResult = await prisma.$queryRaw`
        SELECT MIN(createdAt) as firstDate, MAX(createdAt) as lastDate
        FROM card_exchanges 
        WHERE creatorIp = ${userIp}
      ` as Array<{firstDate: Date | null, lastDate: Date | null}>;
      
      let participationDays = 0;
      let userFirstExchange = null;
      let userLastExchange = null;
      
      if (userTimeRangeResult[0]?.firstDate && userTimeRangeResult[0]?.lastDate) {
        const firstDate = userTimeRangeResult[0].firstDate;
        const lastDate = userTimeRangeResult[0].lastDate;
        
        userFirstExchange = { createdAt: firstDate };
        userLastExchange = { createdAt: lastDate };
        
        participationDays = userExchanges.length > 1 ? 
          Math.ceil((new Date(lastDate).getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
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
        averageLifespan: averageLifespanHours, // 返回小时数，前端根据大小选择单位
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