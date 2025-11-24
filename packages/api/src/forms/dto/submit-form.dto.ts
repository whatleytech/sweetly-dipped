import type { ISubmitFormDto } from '@sweetly-dipped/shared-types';

export class SubmitFormDto implements ISubmitFormDto {
  orderNumber!: string;
  submittedAt!: string;
}
