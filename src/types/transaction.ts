export default interface ITransaction {
    id: string;
    amount: number;
    currency: string;
    description?: string;
    createdAt: Date;
}