import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// 获取项目统计数据
export async function GET() {
  try {
    // 获取社区模板总数（已审核的）
    const totalTemplates = await prisma.userTemplate.count({
      where: {
        isApproved: true
      }
    });

    // 获取独立用户数量（基于IP去重）
    const uniqueUsers = await prisma.userTemplate.groupBy({
      by: ['creatorIp'],
      where: {
        isApproved: true
      }
    });
    const totalUsers = uniqueUsers.length;

    // 获取纹理贡献数量（已审核的）
    const totalTextures = await prisma.textureContribution.count({
      where: {
        isApproved: true
      }
    });

    // 读取纹理数据文件获取总纹理数量
    const textureDataPath = path.join(process.cwd(), 'src/data/textureData.json');
    const textureFileContent = fs.readFileSync(textureDataPath, 'utf-8');
    const textureData = JSON.parse(textureFileContent);
    const totalTextureAssets = Object.keys(textureData.textures || {}).length;

    // 获取集卡交换记录数量
    const totalCardExchanges = await prisma.cardExchange.count();

    // 获取队友匹配记录数量
    const totalTeammateMatches = await prisma.teammateMatchRecord.count();

    // 获取总点赞数
    const totalLikes = await prisma.templateLike.count();

    // 估算生成代码数量（基于模板数量和点赞数的合理估算）
    const estimatedGeneratedCodes = Math.floor(totalTemplates * 15 + totalLikes * 3);

    return NextResponse.json({
      totalTemplates,
      totalUsers,
      totalTextures,
      totalTextureAssets,
      totalCardExchanges,
      totalTeammateMatches,
      totalLikes,
      totalGeneratedCodes: estimatedGeneratedCodes,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}