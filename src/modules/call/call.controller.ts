import {
  Get,
  Req,
  Body,
  Post,
  Query,
  Param,
  HttpCode,
  UseGuards,
  HttpStatus,
  Controller,
} from '@nestjs/common';

import { Call } from '@one-root/markhet-core';

import { CallService } from './call.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionGuard } from '../session/guards/session.guard';

import { IvrDto } from './dto/ivr.dto';
import { AnswerCallDto } from './dto/answer-call.dto';
import { CreateCallDto } from './dto/create-call.dto';
import { DialActionDto } from './dto/dial-action.dto';
import { ConcludeCallDto } from './dto/conclude-call.dto';
import { TransferCallDto } from './dto/transfer-call.dto';
import { AnswerCallbackDto } from './dto/answer-callback.dto';
import { UpdateCallRecordingDto } from './dto/update-call-recording.dto';
import { GetCallsQueryParamsDto } from './dto/get-calls-query-params.dto';

import { CallType } from '../../common/enums/call.enum';
import { CustomRequest } from '../../common/interfaces/express.interface';
import { ApiResponse } from '../../common/interceptors/api-response.interceptor';

@Controller('calls')
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Get()
  @UseGuards(JwtAuthGuard, SessionGuard)
  async getCallsByType(
    @Query() params: GetCallsQueryParamsDto,
    @Req() request: CustomRequest,
  ): Promise<ApiResponse<Call[]>> {
    const { user } = request;

    const calls = await this.callService.find(user.id, params);

    return new ApiResponse(
      HttpStatus.OK,
      `${params.category ?? 'all'} calls fetched successfully`,
      calls,
    );
  }

  @Post('initiate')
  @UseGuards(JwtAuthGuard, SessionGuard)
  async initiate(
    @Body() createCallDto: CreateCallDto,
  ): Promise<ApiResponse<Call>> {
    const call = await this.callService.initiateCall(createCallDto);

    return new ApiResponse(200, 'success', call);
  }

  @Get('service-number')
  @UseGuards(JwtAuthGuard, SessionGuard)
  async getServiceNumber(
    @Req() request: CustomRequest,
  ): Promise<ApiResponse<string>> {
    const number = await this.callService.getRandomServiceNumber(request.user);

    return new ApiResponse(
      HttpStatus.OK,
      'service number fetched successfully',
      process.env.NODE_ENV === 'production' ? number : '+918035737250',
    );
  }

  @Post('answer')
  @HttpCode(200)
  async answer(@Body() answerCallDto: AnswerCallDto) {
    try {
      return await this.callService.answerCall(answerCallDto);
    } catch (error) {
      console.error('Error in answer call endpoint:', error);
      
      // Return valid XML on error
      const Plivo = require('plivo');
      const response = Plivo.Response();
      response.addSpeak('An error occurred. Please try again later.');
      response.addHangup();
      return response.toXML();
    }
  }

  @Post('answer-callback')
  @HttpCode(200)
  async answerCallback(@Body() answerCallbackDto: AnswerCallbackDto) {
    try {
      return await this.callService.answerCallback(answerCallbackDto);
    } catch (error) {
      console.error('Error in answer callback endpoint:', error);
      // Acknowledge webhook received
      return { status: 'error', message: error.message };
    }
  }

  @Post('end')
  @HttpCode(200)
  async end(@Body() concludeCallDto: ConcludeCallDto) {
    try {
      return await this.callService.concludeCall(concludeCallDto);
    } catch (error) {
      console.error('Error in conclude call endpoint:', error, concludeCallDto);
      // Don't throw - acknowledge webhook received
      return { status: 'error', message: error.message };
    }
  }

  @Post('transfer')
  @HttpCode(200)
  async transferCall(@Body() transferCallDto: TransferCallDto) {
    return await this.callService.transferCall(transferCallDto);
  }

  @Post('recording')
  @HttpCode(200)
  async updateRecording(
    @Body() updateCallRecordingDto: UpdateCallRecordingDto,
  ) {
    return await this.callService.updateRecording(updateCallRecordingDto);
  }

  @Post('dial-action')
  @HttpCode(200)
  async connectAgent(@Body() dialActionDto: DialActionDto) {
    try {
      const result = await this.callService.dialAction(dialActionDto);
      
      if (!result) {
        // Fallback: should never happen, but ensure we return valid XML
        const Plivo = require('plivo');
        const response = Plivo.Response();
        response.addHangup();
        return response.toXML();
      }
      
      return result;
    } catch (error) {
      console.error('Error in dial-action endpoint:', error);
      
      // Always return valid XML even on error
      const Plivo = require('plivo');
      const response = Plivo.Response();
      response.addSpeak('An error occurred. Please try again.');
      response.addHangup();
      return response.toXML();
    }
  }

  @Post('dial-action-callback')
  @HttpCode(200)
  async dialActionCallback(@Body() answerCallbackDto: AnswerCallbackDto) {
    try {
      return await this.callService.dialActionCallback(answerCallbackDto);
    } catch (error) {
      console.error('Error in dial-action-callback endpoint:', error);
      // Acknowledge webhook received even on error
      return { status: 'error', message: error.message };
    }
  }

  @Post('caller-tune/:type')
  @HttpCode(200)
  async getCallerTune(@Param('type') type: CallType) {
    return await this.callService.getCallerTune(type);
  }

  @Post('conference/:conferenceName')
  @HttpCode(200)
  async createConference(@Param('conferenceName') conferenceName: string) {
    return await this.callService.createConference({ conferenceName });
  }

  @Post('ivr')
  @HttpCode(200)
  async ivr(@Body() ivrDTO: IvrDto) {
    return await this.callService.handleIvr(ivrDTO);
  }
}
