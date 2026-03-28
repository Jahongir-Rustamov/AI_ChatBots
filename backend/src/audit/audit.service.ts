import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { prisma } from 'lib/prisma';

@Injectable()
export class AuditService {
    async logAction(userId: string, action: string, metadata?: Record<string, any>) {
        try {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action,
                    metadata: metadata ? JSON.stringify(metadata) : null,
                },
            });
        } catch (error) {
            console.error('Failed to create audit log:', error);
            throw new InternalServerErrorException(
                'Error in creating audit log ==> ' + (error as Error)?.message,
            );
        }
    }
}
