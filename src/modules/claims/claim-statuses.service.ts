import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClaimStatus } from './entities/claim-status.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClaimStatusesService {
    constructor(
        @InjectRepository(ClaimStatus)
        private readonly claimStatusRepository: Repository<ClaimStatus>,
    ) {}

    findAll() {
        return this.claimStatusRepository.find({
            order: { sequence: 'ASC', id: 'ASC' },
        });
    }

    async findOne(id: number) {
        const status = await this.claimStatusRepository.findOne({ where: { id } });
        if (!status) throw new NotFoundException('Claim status not found');
        return status;
    }

    create(dto: { code: string; name: string; sequence: number }) {
        const status = this.claimStatusRepository.create(dto);
        return this.claimStatusRepository.save(status);
    }

    async update(id: number, dto: { code: string; name: string; sequence: number }) {
        const status = await this.findOne(id);

        status.code = dto.code;
        status.name = dto.name;
        status.sequence = dto.sequence;

        return this.claimStatusRepository.save(status);
    }

    async remove(id: number) {
        const status = await this.findOne(id);
        await this.claimStatusRepository.remove(status);
        return { message: 'Claim status deleted successfully' };
    }
}