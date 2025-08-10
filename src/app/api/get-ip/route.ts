import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 获取客户端IP地址
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = request.headers.get('x-client-ip');
    
    // 优先级：x-forwarded-for > x-real-ip > x-client-ip > 连接IP
    let ip = forwarded?.split(',')[0] || realIp || clientIp;
    
    // 如果是本地开发环境，返回模拟IP
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127.0.0.1')) {
      ip = '127.0.0.1'; // 本地开发环境使用固定IP
    }
    
    return NextResponse.json({ ip });
  } catch (error) {
    console.error('Error getting IP:', error);
    return NextResponse.json({ ip: '127.0.0.1' }, { status: 200 });
  }
}