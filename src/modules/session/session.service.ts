import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { Not, Repository } from 'typeorm';

import { User, Session } from '@one-root/markhet-core';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly jwtService: JwtService,
  ) {}

  async createSession(user: User, deviceId: string): Promise<Session> {
    const expirationTime = Date.now() + 7 * 24 * 60 * 60 * 1000;

    // payload
    const payload = {
      userId: user.id,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    let session = await this.sessionRepository.findOne({
      where: { user: { id: user.id }, deviceId: deviceId },
    });

    if (session) {
      session.accessToken = accessToken;
      session.refreshToken = refreshToken;
      session.expiresAt = new Date(expirationTime);
    } else {
      session = this.sessionRepository.create({
        user,
        accessToken,
        refreshToken,
        deviceId,
        expiresAt: new Date(expirationTime),
      });
    }

    await this.sessionRepository.update(
      { user: user, deviceId: Not(deviceId) },
      { expiresAt: new Date() },
    );

    return this.sessionRepository.save(session);
  }

  async findSessionByRefreshToken(refreshToken: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { refreshToken },
      relations: ['user'],
    });

    if (!session) {
      throw new NotFoundException(
        'session with the provided refresh token not found',
      );
    }

    return session;
  }

  async refreshSession(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const session = await this.findSessionByRefreshToken(refreshToken);

    if (session.expiresAt <= new Date()) {
      this.deleteSession(session.id);

      throw new BadRequestException(
        'refresh token expired, please log in again',
      );
    }

    const accessToken = this.jwtService.sign({ userId: session.user.id });

    const newRefreshToken = this.jwtService.sign(
      { userId: session.user.id },
      { expiresIn: '7d' },
    );

    session.accessToken = accessToken;
    session.refreshToken = newRefreshToken;

    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.sessionRepository.save(session);

    return { accessToken, refreshToken: newRefreshToken };
  }

  findSessionsByUserId(userId: string): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { user: { id: userId } },
    });
  }

  async isSessionValid(sessionId: string): Promise<boolean> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('session not found for the given id');
    }

    // TODO => verify condition
    return session.expiresAt <= new Date();
  }

  async deleteSession(sessionId: string): Promise<void> {
    const result = await this.sessionRepository.delete(sessionId);

    if (result.affected === 0) {
      throw new NotFoundException('session not found for the given id');
    }
  }

  async logout(userId: string, deviceId: string): Promise<void> {
    const deleteResult = await this.sessionRepository.delete({
      user: { id: userId },
      deviceId,
    });

    if (deleteResult.affected === 0) {
      throw new NotFoundException('session not found or already logged out');
    }
  }
}
