import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PO, POInterest, User } from '@one-root/markhet-core';
import { Repository } from 'typeorm';
import { AddPOInterestDto } from './dto/add-po.dto';
import { CropName } from 'src/common/enums/farm.enum';

@Injectable()
export class PoService {
  private readonly logger = new Logger(PoService.name);

  constructor(
    @InjectRepository(PO)
    private readonly pORepository: Repository<PO>,
    @InjectRepository(POInterest)
    private readonly poInterestRepository: Repository<POInterest>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAll(cropName: CropName): Promise<PO[]> {
    try {
      const cards = await this.pORepository.find({
        where: {
          cropName: cropName,
          isActive: true,
        },
        relations: ['interests', 'interests.user'],
      });

      if (!cards || cards.length === 0) {
        this.logger.warn('No purchase orders found');
        throw new NotFoundException('No purchase orders found');
      }

      this.logger.log(`Fetched ${cards.length} purchase orders`);
      return cards;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // let 404 propagate
      }
      this.logger.error('Failed to fetch purchase orders', error.stack);
      throw new InternalServerErrorException('Failed to fetch purchase orders');
    }
  }

  async getPoById(id: string) {
    try {
      const po = await this.pORepository.findOne({
        where: { id },
        relations: ['interests', 'interests.user'],
      });

      if (!po) {
        this.logger.warn(`PO not found with id: ${id}`);
        throw new NotFoundException(`PO not found with id: ${id}`);
      }

      this.logger.log(`Fetched PO with id: ${id}`);
      return po;
    } catch (error) {
      this.logger.error(`Failed to fetch PO with id: ${id}`, error.stack);
      throw new InternalServerErrorException(
        `Failed to fetch PO with id: ${id}`,
      );
    }
  }

  async addInterestToPO(dto: AddPOInterestDto, userId: string) {
    try {
      const po = await this.pORepository.findOne({ where: { id: dto.poId } });
      if (!po) {
        this.logger.warn(`PO not found with id: ${dto.poId}`);
        throw new NotFoundException(`PO not found with id: ${dto.poId}`);
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        this.logger.warn(`User not found with id: ${userId}`);
        throw new NotFoundException(`User not found with id: ${userId}`);
      }

      let existingInterest = await this.poInterestRepository.findOne({
        where: { po: { id: po.id }, user: { id: user.id } },
      });

      let interest;
      if (existingInterest) {
        this.logger.log(
          `User ${user.id} already has interest in PO ${po.id}, updating quantity and commitDate`,
        );
        existingInterest.quantity = dto.quantity;
        existingInterest.commitDate = new Date(dto.commitDate);
        interest = await this.poInterestRepository.save(existingInterest);
      } else {
        interest = this.poInterestRepository.create({
          po,
          user,
          quantity: dto.quantity,
          commitDate: new Date(dto.commitDate),
        });

        this.logger.log(
          `Adding new interest for user ${user.id} to PO ${po.id}`,
        );
        interest = await this.poInterestRepository.save(interest);
      }

      //  Fire WhatsApp notification asynchronously
      this.sendWhatsAppMessageToIntrestShown(po, user).catch((err) =>
        this.logger.error('Failed to send WhatsApp notification', err.stack),
      );

      return interest;
    } catch (error) {
      this.logger.error(`Failed to add interest to PO`, error.stack);
      throw new InternalServerErrorException('Failed to add interest to PO');
    }
  }

  async sendWhatsAppMessageToIntrestShown(po: PO, buyer: User) {
    try {
      const buyerPhone = buyer.mobileNumber.startsWith('+91')
        ? buyer.mobileNumber
        : `+91${buyer.mobileNumber}`;

      const formatDateToDDMMYYYY = (date: Date | string | null): string => {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      };

      const formatTimestampIST = (): string => {
        const now = new Date();
        const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
        const day = String(istTime.getUTCDate()).padStart(2, '0');
        const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
        const year = istTime.getUTCFullYear();
        const hours = String(istTime.getUTCHours()).padStart(2, '0');
        const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
        const seconds = String(istTime.getUTCSeconds()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
      };

      // Helper function to sanitize field values - remove newlines, tabs, and reduce multiple spaces
      const sanitizeValue = (value: string): string => {
        if (!value) return '';
        return value
          .replace(/[\n\r\t]/g, ' ') // Replace newlines and tabs with space
          .replace(/\s{4,}/g, ' ') // Replace 4+ consecutive spaces with single space
          .trim(); // Remove leading/trailing whitespace
      };

      // Extract first 5 digits from PO ID
      const shortPOId = po.id.substring(0, 5);

      const formattedPrice = po.price_rate?.toString() || '0';

      const fields = [
        {
          action: 'set_field_value',
          field_name: 'buyer_name',
          value: sanitizeValue(buyer.name),
        },
        {
          action: 'set_field_value',
          field_name: 'Buyer_Phone',
          value: buyerPhone,
        },
        {
          action: 'set_field_value',
          field_name: 'Company_name',
          value: sanitizeValue(po.companyName || ''),
        },
        {
          action: 'set_field_value',
          field_name: 'Crop_Name',
          value: sanitizeValue(po.cropName || ''),
        },
        {
          action: 'set_field_value',
          field_name: 'PO_quantity',
          value: sanitizeValue(po.minQuantity?.toString() || ''),
        },
        {
          action: 'set_field_value',
          field_name: 'weight_unit',
          value: sanitizeValue(po.measure || ''),
        },
        {
          action: 'set_field_value',
          field_name: 'Accepted_price',
          value: sanitizeValue(formattedPrice),
        },
        {
          action: 'set_field_value',
          field_name: 'specs',
          value: sanitizeValue(po.specification_en || ''),
        },
        {
          action: 'set_field_value',
          field_name: 'Delivery_location',
          value: sanitizeValue(
            `${po.village || ''}, ${po.taluk || ''}, ${po.district || ''}`.trim(),
          ),
        },
        {
          action: 'set_field_value',
          field_name: 'delivery_by_date',
          value: formatDateToDDMMYYYY(po.expiresAt),
        },
        {
          action: 'set_field_value',
          field_name: 'payment_terms',
          value: '80% on weighment slip and 20% after GRN',
        },
        {
          action: 'set_field_value',
          field_name: 'PO_id',
          value: shortPOId,
        },
        {
          action: 'set_field_value',
          field_name: 'po_interest_timestamp',
          value: formatTimestampIST(),
        },
      ];

      // Remove the pretty-printing (null, 2) - send compact JSON
      this.logger.log(
        `WhatsApp message sent for PO ${po.id} (buyer + support)`,
      );

      await this.sendChatRaceMessage(buyerPhone, fields, 1760076045533);

      const supportNumbers = [
        '+918309508690',
        '+917338033341',
        '+918792006444',
      ];
      for (const supportPhone of supportNumbers) {
        await this.sendChatRaceMessage(supportPhone, fields, 1760076693089);
      }

      this.logger.log(
        `WhatsApp message sent for PO ${po.id} (buyer + support)`,
      );
    } catch (err) {
      this.logger.error('Error sending WhatsApp message for interest:', err);
    }
  }

  private async sendChatRaceMessage(
    phone: string,
    actions: any[],
    flowId: number,
  ) {
    const updatedActions = [
      ...actions,
      { action: 'send_flow', flow_id: flowId },
    ];

    try {
      const response = await fetch('https://api.chatrace.com/users', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-ACCESS-TOKEN': process.env.CHATRACE_API_KEY,
        },
        body: JSON.stringify({
          phone,
          actions: updatedActions,
        }),
      });

      const result = await response.json();
      this.logger.log(
        `ChatRace response for ${phone}: ${JSON.stringify(result)}`,
      );
    } catch (error) {
      this.logger.error(`Error sending ChatRace message:`, error);
    }
  }
}
