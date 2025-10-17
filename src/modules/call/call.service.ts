import * as Plivo from 'plivo';
import { format, addMinutes } from 'date-fns';

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Not, IsNull, MoreThan, Repository } from 'typeorm';

import { Call, User } from '@one-root/markhet-core';

import { IvrDto } from './dto/ivr.dto';
import { AnswerCallDto } from './dto/answer-call.dto';
import { CreateCallDto } from './dto/create-call.dto';
import { DialActionDto } from './dto/dial-action.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { ConcludeCallDto } from './dto/conclude-call.dto';
import { TransferCallDto } from './dto/transfer-call.dto';
import { AnswerCallbackDto } from './dto/answer-callback.dto';
import { CreateConferenceDto } from './dto/create-conference.dto';
import { UpdateCallRecordingDto } from './dto/update-call-recording.dto';
import { GetCallsQueryParamsDto } from './dto/get-calls-query-params.dto';

import { UserService } from '../user/user.service';
import { CropService } from '../crop/crop.service';
import { TicketService } from '../ticket/ticket.service';
import { WhatsAppService } from '../notification/whatsapp/whatsapp.service';

import { EventPublisher } from '../event/publisher/event.publisher';

import {
  CallType,
  CallStatus,
  CallCategory,
} from '../../common/enums/call.enum';
import { CropType } from '../..//common/types/crop.type';
import { TicketType } from '../../common/enums/ticket.enum';
import { Identity, Language } from '../../common/enums/user.enum';
import { MostRecentCallType } from '../../common/types/call.type';
import { WhatsAppMessageType } from '../../common/enums/notification.enum';
import { EventQueue, NotificationEvent } from '../../common/enums/event.enum';

@Injectable()
export class CallService {
  private client: Plivo.Client;
  private readonly logger = new Logger(CallService.name);

  constructor(
    @InjectRepository(Call)
    private readonly callRepository: Repository<Call>,

    private readonly userService: UserService,

    private readonly cropService: CropService,

    private readonly ticketService: TicketService,

    private readonly eventPublisher: EventPublisher,

    private readonly whatsAppService: WhatsAppService,
  ) {
    const id = process.env.PLIVO_AUTH_ID;
    const token = process.env.PLIVO_AUTH_TOKEN;

    if (!id || !token) {
      throw new Error('Plivo credentials are not set in environment variables');
    }

    this.client = new Plivo.Client(id, token);
    this.logger.log('CallService initialized with Plivo client');
  }

  async find(userId: string, params: GetCallsQueryParamsDto): Promise<Call[]> {
    const { page, limit, category } = params;

    const skip = (page - 1) * limit;

    const options: Record<string, any> = {
      skip,
      take: limit,
      where: {},
      order: {
        createdAt: 'DESC',
      },
      relations: ['from', 'to', 'crop', 'crop.farm'],
    };

    if (category) {
      switch (category) {
        case CallCategory.MISSED:
          options.where['to'] = { id: userId };
          options.where['callStatus'] = In([
            CallStatus.TIMEOUT,
            CallStatus.NO_ANSWER,
          ]);
          options.where['agent'] = IsNull();
          break;

        case CallCategory.RECEIVED:
          options.where['to'] = { id: userId };
          options.where['callStatus'] = CallStatus.COMPLETED;
          options.where['agent'] = IsNull();
          break;

        case CallCategory.DIALED:
          options.where['from'] = { id: userId };
          break;

        default:
          throw new Error(`unknown call category '${category}'`);
      }
    } else {
      options.where = [{ from: { id: userId } }, { to: { id: userId } }];
    }

    return this.callRepository.find(options);
  }

  async findOne(id: string): Promise<Call> {
    const call = await this.callRepository.findOne({
      where: { id },
    });

    if (!call) {
      throw new NotFoundException(`call record with id ${id} not found`);
    }

    return call;
  }

  async findByCallUUID(callUUID: string): Promise<Call> {
    const call = await this.callRepository.findOne({
      where: { callUUID },
      relations: ['from', 'to', 'crop'],
    });

    if (!call) {
      throw new NotFoundException(
        `call record with call uuid ${callUUID} not found`,
      );
    }

    return call;
  }

  async update(id: string, updateCallDto: UpdateCallDto): Promise<Call> {
    const call = await this.findOne(id);

    Object.assign(call, updateCallDto);

    return this.callRepository.save(call);
  }

  async getMostRecentCall(userId: string): Promise<MostRecentCallType> {
    const window = new Date();

    window.setHours(window.getHours() - 24);

    const call = await this.callRepository.findOne({
      where: [
        {
          from: { id: userId },
          to: { id: Not(userId) },
          createdAt: MoreThan(window),
        },
        {
          to: { id: userId },
          from: { id: Not(userId) },
          createdAt: MoreThan(window),
        },
      ],
      order: { createdAt: 'DESC' },
      relations: ['from', 'to', 'crop'],
    });

    if (!call) {
      throw new NotFoundException(
        `no call records found for user with id ${userId}`,
      );
    }

    const match = call.from.id === userId ? 'to' : 'from';

    return { call, match };
  }

  async getRandomServiceNumber(user: User): Promise<string> {
    const { identity } = user;

    let numbers: string[];

    if (identity === Identity.FARMER) {
      numbers = ['+918035737550'];
    } else if (identity === Identity.BUYER) {
      numbers = ['+918035737660', '+918035739960'];
    } else {
      throw new Error(`invalid identity '${identity}'.`);
    }

    const number = numbers[Math.floor(Math.random() * numbers.length)];

    return number;
  }

  async initiateCall(createCallDto: CreateCallDto) {
    const { fromId, toId, cropId, cropName, serviceNumber } = createCallDto;

    // get users concurrently
    const [fromUser, toUser] = await Promise.all([
      this.userService.findById(fromId),
      this.userService.findById(toId),
    ]);

    if (!fromUser)
      throw new NotFoundException(`user with id ${fromId} not found`);

    if (!toUser) throw new NotFoundException(`user with id ${toId} not found`);

    let crop: CropType = null;

    if (cropId && cropName) {
      crop = await this.cropService.findOne(cropName, cropId);

      if (!crop)
        throw new NotFoundException(`crop with id ${cropId} not found`);
    }

    // create call record
    const call = this.callRepository.create({
      from: fromUser,
      to: toUser,
      crop,
      serviceNumber,
    });

    return this.callRepository.save(call);
  }

  async answerCall(answerCallDto: AnswerCallDto) {
    const {
      CallUUID: callUUID,
      From: fromNumber,
      To: toNumber,
      CallStatus: callStatus,
      Direction: direction,
      Event: event,
      ParentAuthID: parentAuthId,
      STIRAttestation: stirAttestation,
      STIRVerification: stirVerification,
      RouteType: routeType,
    } = answerCallDto;

    this.logger.log(`Answer call received: ${callUUID} from ${fromNumber} to ${toNumber}`);

    // get the user by mobile number
    const user = await this.userService.findByMobileNumber(fromNumber);

    // if there is no user
    if (!user) {
      this.logger.warn(`User not found for mobile number: ${fromNumber}`);
      const response = Plivo.Response();

      // play 'user not found' tune
      response.addPlay(process.env.PLIVO_USER_NOT_FOUND_CALLER_TUNE_URL);

      return response.toXML();
    }

    // get the most recent call for the user
    let call: any;
    let match: string;

    try {
      const result = await this.getMostRecentCall(user.id);
      call = result.call;
      match = result.match;
    } catch (error) {
      this.logger.warn(`No recent call found for user ${user.id}: ${error.message}`);
      const response = Plivo.Response();

      // play 'call not found' tune
      response.addPlay(process.env.PLIVO_CALL_NOT_FOUND_CALLER_TUNE_URL);

      return response.toXML();
    }

    // payload
    const payload: UpdateCallDto = {
      callUUID,
      callStatus,
      direction,
      event,
      stirAttestation,
      stirVerification,
      routeType,
      parentAuthId,
    };

    const response = Plivo.Response();

    // configure recording
    response.addRecord({
      // only send request to action, don’t redirect
      redirect: 'false',

      // max recording duration (in seconds)
      maxLength: '3600',

      // start after the call is answered
      startOnDialAnswer: 'true',

      // enable session-level recording
      recordSession: 'true',

      // url to handle recording data
      action: `${process.env.SERVER_ENDPOINT}/calls/recording`,
    });

    // configure dial
    const dial = response.addDial({
      // timeout for the call
      timeout: '30',

      // caller id to display
      callerId: toNumber,

      // HTTP method for the action url
      method: 'POST',

      // url to handle dial action
      action: `${process.env.SERVER_ENDPOINT}/calls/dial-action`,

      // music played during call setup
      dialMusic: `${process.env.SERVER_ENDPOINT}/calls/caller-tune/${CallType.VOICE}`,

      // url to handle call events (answer, connect or hang up)
      callbackUrl: `${process.env.SERVER_ENDPOINT}/calls/answer-callback`,
    });

    // add the matched user's mobile number to the dial
    dial.addNumber(call[match].mobileNumber);

    // update the call record
    await this.update(call.id, payload);

    return response.toXML();
  }

  async answerCallback(answerCallbackDto: AnswerCallbackDto) {
    const { CallUUID: callUUID, CallStatus: callStatus } = answerCallbackDto;

    this.logger.log(`Answer callback: ${callUUID}, status: ${callStatus}`);

    const call = await this.findByCallUUID(callUUID);

    this.logger.log(`Updating call ${call.id} status: ${call.callStatus} → ${callStatus}`);

    await this.update(call.id, { callStatus });
  }

  async transferCall(transferCallDto: TransferCallDto) {
    const { callUUID, participantIds } = transferCallDto;

    const conferenceName = `conference:${callUUID}`;

    // create a new conference for call transfer
    await this.createConference({ conferenceName });

    // transfer the call to the conference
    await this.client.calls.transfer(callUUID, {
      legs: 'both',
      alegUrl: `${process.env.SERVER_ENDPOINT}/calls/conference/${conferenceName}`,
      alegMethod: 'POST',
      blegUrl: `${process.env.SERVER_ENDPOINT}/calls/conference/${conferenceName}`,
      blegMethod: 'POST',
    });

    // get the call record
    const call = await this.findByCallUUID(callUUID);

    const participants: User[] = [];

    for (const participantId of participantIds) {
      // get the participant by participant id
      const user = await this.userService.findById(participantId);

      // initiate the call to the participant and add them to the conference
      await this.client.calls.create(
        // caller id to show
        call.serviceNumber,

        // participant's mobile number
        user.mobileNumber,

        // conference callback url
        `${process.env.SERVER_ENDPOINT}/calls/conference/${conferenceName}`,
      );

      participants.push(user);
    }

    // update the call record
    await this.update(call.id, {
      participants,
      conferenceName,
      callType: CallType.CONFERENCE,
    });
  }

  async concludeCall(concludeCallDto: ConcludeCallDto) {
    const {
      CallUUID: callUUID,
      Duration: duration,
      CallStatus: callStatus,
      HangupCause: hangupCause,
      HangupCauseName: hangupCauseName,
      HangupSource: hangupSource,
      StartTime: startStamp,
      EndTime: endStamp,
    } = concludeCallDto;

    this.logger.log(`Conclude call webhook: ${callUUID}, status: ${callStatus}, duration: ${duration}s`);

    // get the call record
    const call = await this.findByCallUUID(callUUID);

    this.logger.log(`Call ${callUUID} transitioning: ${call.callStatus} → ${callStatus}`);

    // update the call record
    await this.update(call.id, {
      callStatus,
      duration,
      hangupCause,
      hangupCauseName,
      hangupSource,
      startStamp,
      endStamp,
    });

    // check if call was completed or missed
    if (
      ![
        CallStatus.COMPLETED,
        CallStatus.BUSY,
        CallStatus.TIMEOUT,
        CallStatus.NO_ANSWER,
      ].includes(callStatus)
    ) {
      this.logger.log(`Skipping WhatsApp notification for status: ${callStatus}`);
      return;
    }

    // Check if crop exists before sending notification
    if (!call.crop) {
      this.logger.warn(`Call ${callUUID} has no associated crop, skipping WhatsApp notification`);
      return;
    }

    // select template based on call status
    const template =
      callStatus === CallStatus.COMPLETED
        ? 'markhet_app_received'
        : 'markhet_app_missed';

    // payload
    const payload = {
      queue: EventQueue.NOTIFICATION,
      type: NotificationEvent.WHATSAPP,
      data: {
        data: {
          type: WhatsAppMessageType.TEMPLATE,
          template: `${template}_${call.to.identity.toLowerCase()}`,
          components: [
            {
              type: 'header',
              parameters: [
                {
                  type: 'image',
                  image: {
                    link: 'https://storage.googleapis.com/markhet-storage/assets/markhet-banner-kn.jpg',
                  },
                },
              ],
            },
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: call.from.name,
                },
                {
                  type: 'text',
                  text: call.from.taluk,
                },
                {
                  type: 'text',
                  text: call.from.district,
                },
                {
                  type: 'text',
                  text: call.crop.cropName,
                },
                {
                  type: 'text',
                  // convert UTC time to IST by adding 330 minutes (5 hours 30 minutes)
                  text: format(
                    addMinutes(new Date(call.createdAt), 330),
                    'PPpp',
                  ),
                },
                {
                  type: 'text',
                  text: call.from.mobileNumber,
                },
              ],
            },
            {
              index: 0,
              type: 'button',
              sub_type: 'url',
              parameters: [
                {
                  type: 'text',
                  text: `${call.to.identity.toLowerCase()}/calls`,
                },
              ],
            },
          ],
        },
        userIds: [call.to.id],
        language: Language.KN,
      },
    };

    // options
    const options = { removeOnComplete: true, removeOnFail: true };

    await this.eventPublisher.publish(payload, options);
  }

  async updateRecording(updateCallRecordingDto: UpdateCallRecordingDto) {
    const { CallUUID: callUUID, RecordUrl: recordingUrl } =
      updateCallRecordingDto;

    this.logger.log(`Recording ready for call: ${callUUID}, URL: ${recordingUrl}`);

    // get the call record
    const call = await this.findByCallUUID(callUUID);

    // update the call record
    await this.update(call.id, { recordingUrl });
  }

  async createConference(createConferenceDto: CreateConferenceDto) {
    const { conferenceName } = createConferenceDto;

    const response = Plivo.Response();

    response.addConference(conferenceName, {
      // enable recording
      record: 'true',

      // limit to 3 members
      maxMembers: '3',

      // sound when someone enters
      enterSound: 'beep:1',

      // sound when someone exits
      exitSound: 'beep:2',

      // keep conference open with one participant
      stayAlone: 'false',

      // start conference when first participant enters
      startConferenceOnEnter: 'true',

      // waiting sound
      waitSound: `${process.env.SERVER_ENDPOINT}/calls/caller-tune/${CallType.CONFERENCE}`,
    });

    return response.toXML();
  }

  async getCallerTune(type: CallType): Promise<string> {
    let url: string;

    switch (type) {
      case CallType.VOICE:
        url = process.env.PLIVO_VOICE_CALLER_TUNE_URL;
        break;

      case CallType.CONFERENCE:
        url = process.env.PLIVO_CONFERENCE_CALLER_TUNE_URL;
        break;

      case CallType.NOT_FOUND:
        url = process.env.PLIVO_CALL_NOT_FOUND_CALLER_TUNE_URL;
        break;

      default:
        throw new Error(`unknown call type '${type}'`);
    }

    if (!url) throw new Error(`caller tune url not found for type '${type}'`);

    const response = Plivo.Response();

    // add the caller tune url to the response
    response.addPlay(url);

    return response.toXML();
  }

  async dialAction(dialActionDto: DialActionDto) {
    const {
      CallUUID: callUUID,
      DialStatus: dialStatus,
      To: toNumber,
    } = dialActionDto;

    this.logger.log(`Dial action received: ${callUUID}, status: ${dialStatus}`);

    // get the call record
    const call = await this.findByCallUUID(callUUID);

    const response = Plivo.Response();

    if (
      [CallStatus.BUSY, CallStatus.FAILED, CallStatus.NO_ANSWER].includes(
        dialStatus,
      )
    ) {
      this.logger.warn(`Dial failed for call ${callUUID}: ${dialStatus}`);

      // get an available agent
      const agent = await this.userService.getAvailableAgent();

      if (agent) {
        this.logger.log(`Connecting to agent: ${agent.mobileNumber}`);
        await this.update(call.id, { agent });

        const dial = response.addDial({
          // timeout for the call
          timeout: '30',

          // caller id to show
          callerId: toNumber,

          // music played while waiting
          dialMusic: `${process.env.SERVER_ENDPOINT}/calls/caller-tune/${CallType.CONFERENCE}`,

          // url to handle call events (answer, connect or hang up)
          callbackUrl: `${process.env.SERVER_ENDPOINT}/calls/dial-action-callback`,
        });

        // add the agent's mobile number to the dial
        dial.addNumber(agent.mobileNumber);

        return response.toXML();
      } else {
        // No agent available - play message and hang up properly
        this.logger.warn(`No agent available for call ${callUUID}`);

        response.addSpeak('Sorry, all agents are currently busy. Please try again later.');

        // Update status to failed since we can't connect
        await this.update(call.id, {
          callStatus: CallStatus.FAILED,
          hangupCause: 'no_agent_available',
          endStamp: new Date().toISOString(),
        });

        response.addHangup();
        return response.toXML();
      }
    }

    // For successful dials, return empty XML to let call continue
    this.logger.log(`Dial successful for call ${callUUID}`);
    return response.toXML();
  }

  async dialActionCallback(answerCallbackDto: AnswerCallbackDto) {
    const { CallUUID: callUUID, CallStatus: callStatus } = answerCallbackDto;

    this.logger.log(`Dial action callback: ${callUUID}, status: ${callStatus}`);

    // get the call record
    const call = await this.findByCallUUID(callUUID);

    this.logger.log(`Updating call ${call.id} status: ${call.callStatus} → ${callStatus}`);

    // update the call record
    await this.update(call.id, { callStatus });
  }

  async handleIvr(ivrDTO: IvrDto) {
    const { input, from } = ivrDTO;

    // get the user by mobile number
    const user = await this.userService.findByMobileNumber(from);

    // pyload
    const payload = {
      type: TicketType.CALL_REQUEST,
      content: `A call request has been received from ${from}.`,
    };

    // template
    const template = 'markhet_app_download_farmer';

    // components
    const components = [
      {
        type: 'header',
        parameters: [
          {
            type: 'image',
            image: {
              link: 'https://storage.googleapis.com/markhet-storage/assets/markhet-banner-kn.jpg',
            },
          },
        ],
      },
    ];

    switch (input) {
      case '1':
        await this.whatsAppService.sendTemplate(
          from,
          template,
          Language.KN,
          components,
        );
        break;

      case '2':
        await this.whatsAppService.sendTemplate(
          from,
          template,
          Language.KN,
          components,
        );

        await this.ticketService.create(user, payload);
        break;

      default:
        throw new Error(`unknown ivr input '${input}'`);
    }
  }
}
