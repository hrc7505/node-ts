export default interface ITransaction {
    id: string;
    createdAt: Date;
    invoices: {
        amount: number;
        currency: string;
        description?: string;
    }[];
}