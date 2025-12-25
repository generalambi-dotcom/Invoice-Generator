import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Enhanced Health Check Endpoint
 * Tests database connection and returns comprehensive system status
 */
export async function GET() {
  const startTime = Date.now();
  const healthStatus: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {},
  };

  try {
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      healthStatus.status = 'error';
      healthStatus.services.database = {
        status: 'not_configured',
        error: 'DATABASE_URL environment variable is not set',
      };
      healthStatus.responseTime = `${Date.now() - startTime}ms`;
      return NextResponse.json(healthStatus, { status: 500 });
    }

    // Test database connection
    const dbStartTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - dbStartTime;
    
    healthStatus.services.database = {
      status: 'connected',
      responseTime: `${dbResponseTime}ms`,
    };

    // Test database query performance
    try {
      const queryStartTime = Date.now();
      await prisma.user.count();
      const queryResponseTime = Date.now() - queryStartTime;
      
      healthStatus.services.database.queryPerformance = `${queryResponseTime}ms`;
    } catch (queryError: any) {
      healthStatus.services.database.queryError = queryError.message;
    }

    // Check environment variables (without exposing secrets)
    healthStatus.environment = {
      nodeEnv: process.env.NODE_ENV || 'development',
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasJwtSecret: !!process.env.JWT_SECRET,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not set',
    };

    // Overall response time
    healthStatus.responseTime = `${Date.now() - startTime}ms`;

    return NextResponse.json(healthStatus);
  } catch (error: any) {
    console.error('Health check failed:', error);
    
    healthStatus.status = 'error';
    healthStatus.services.database = {
      status: 'disconnected',
      error: error.message,
    };
    healthStatus.responseTime = `${Date.now() - startTime}ms`;

    return NextResponse.json(healthStatus, { status: 500 });
  }
}
