export class CobrancaEfiPay {
  code: number;
  data: {
    installments: number;
    installment_value: number;
    charge_id: number;
    status: string;
    refusal?: {
      reason: string;
      retry: boolean;
    };
    total: number;
    payment: string;
  };
}
