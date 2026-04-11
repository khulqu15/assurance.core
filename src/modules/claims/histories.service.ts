import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClaimStatusHistory } from './entities/claim-status-history.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HistoriesService {
    constructor(
        @InjectRepository(ClaimStatusHistory)
        private readonly historyRepository: Repository<ClaimStatusHistory>,
    ) {}

    async findByClaim(claimId: string) {
        return this.historyRepository.find({
            where: { claim: { id: claimId } },
            relations: ['claim', 'fromStatus', 'toStatus', 'actionBy'],
            order: { createdAt: 'ASC' },
        });
    }

    async findOne(id: string) {
        const history = await this.historyRepository.findOne({
            where: { id },
            relations: ['claim', 'fromStatus', 'toStatus', 'actionBy'],
        });

        if (!history) throw new NotFoundException('History not found');
        return history;
    }
}