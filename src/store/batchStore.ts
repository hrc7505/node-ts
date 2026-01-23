type Batch = {
    batchId: string;
    callbackUrl: string;
    invoices: any[];
    status: 'Processing' | 'Paid' | 'Failed';
};

const batches = new Map<string, Batch>();

export function saveBatch(batch: Batch) {
    batches.set(batch.batchId, batch);
}

export function getBatch(batchId: string): Batch | undefined {
    return batches.get(batchId);
}
