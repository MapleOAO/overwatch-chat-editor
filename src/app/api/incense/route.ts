import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createRateLimit, rateLimitConfigs } from '@/utils/rateLimiter';
import { isSuspiciousUserAgent } from '@/utils/validation';

// 创建速率限制器
const incenseRateLimit = createRateLimit(rateLimitConfigs.moderate);

// 获取上香统计
export async function GET() {
  try {
    // 获取总上香次数
    const totalCount = await prisma.incenseRecord.count();
    
    // 获取今日上香次数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayCount = await prisma.incenseRecord.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });
    
    // 获取最近的贡品
    const recentOfferings = await prisma.incenseRecord.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        offering: true,
        createdAt: true
      }
    });
    
    // 获取项目统计数据
    const totalTemplates = await prisma.userTemplate.count({
      where: {
        isApproved: true
      }
    });
    
    const totalUsers = await prisma.userTemplate.groupBy({
      by: ['creatorIp'],
      where: {
        isApproved: true
      }
    }).then(users => users.length);
    
    const totalLikes = await prisma.templateLike.count();
    
    return NextResponse.json({
      totalCount,
      todayCount,
      recentOfferings,
      projectStats: {
        totalTemplates,
        totalUsers,
        totalLikes
      }
    });
  } catch (error) {
    console.error('Error fetching incense stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incense statistics' },
      { status: 500 }
    );
  }
}

// 上香
export async function POST(request: NextRequest) {
  try {
    // 速率限制检查
    const rateLimitResult = await incenseRateLimit(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // 用户代理检查
    const userAgent = request.headers.get('user-agent') || '';
    if (isSuspiciousUserAgent(userAgent)) {
      return NextResponse.json(
        { error: '检测到可疑的请求来源' },
        { status: 403 }
      );
    }

    const { offering } = await request.json();

    if (!offering || typeof offering !== 'string') {
      return NextResponse.json(
        { error: '请选择贡品' },
        { status: 400 }
      );
    }

    // 验证贡品类型
    const validOfferings = [
      '能量饮料',
      '治疗包',
      '护甲包',
      '终极技能充能',
      '传奇皮肤',
      '金色武器',
      '竞技点数',
      '守望币',
      '经验值加成'
    ];

    if (!validOfferings.includes(offering)) {
      return NextResponse.json(
        { error: '无效的贡品类型' },
        { status: 400 }
      );
    }

    // 获取客户端IP
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIP = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // 记录上香
    await prisma.incenseRecord.create({
      data: {
        offering,
        userIp: clientIP
      }
    });

    return NextResponse.json({
      success: true,
      message: `已献上${offering}，愿编辑器安息`
    });
  } catch (error) {
    console.error('Error recording incense:', error);
    return NextResponse.json(
      { error: '上香失败，请稍后重试' },
      { status: 500 }
    );
  }
}