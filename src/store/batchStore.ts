export type Batch = {
    batchId: string;
    callbackUrl: string;
    vendorNo: string;
    invoices: any[];
    status: 'Processing' | 'Paid' | 'Failed';
};

export type PaymentRecord = {
    paymentId: string;
    chiizuPaymentId: string;
    batchId: string;
    status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
    amount?: any;
    sourceDocument?: any;
    callbackUrl: string;
    createdAt: string;
    settledAt?: string;
};

export type WebhookConfig = {
    tenantId: string;
    companyId?: string;
    companyName?: string;
    webhookCallbackUrl: string;
    events?: string[];
    registeredAt: string;
};

const batches = new Map<string, Batch>();
const payments = new Map<string, PaymentRecord>();
let registeredWebhookConfig: WebhookConfig | null = null;

export function saveWebhookConfig(config: WebhookConfig) {
    registeredWebhookConfig = config;
}

export function getWebhookConfig(): WebhookConfig | null {
    return registeredWebhookConfig;
}

export function saveBatch(batch: Batch) {
    batches.set(batch.batchId, batch);
}

export function getBatch(batchId: string): Batch | undefined {
    return batches.get(batchId);
}

export function savePayment(payment: PaymentRecord) {
    payments.set(payment.chiizuPaymentId, payment);
    payments.set(payment.paymentId, payment);
}

export function getPayment(paymentId: string): PaymentRecord | undefined {
    return payments.get(paymentId);
}

