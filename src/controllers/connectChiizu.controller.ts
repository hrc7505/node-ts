import { Request, Response } from "express";
import { log } from "node:console";

const connectChiizu = async (req: Request, res: Response) => {
    log("connect-chiizu headers::", req.headers);
    log("connect-chiizu body::", req.body);

    res.status(201).json({
        tenantId: "chiizu-tenant-001",
    });
};

export default connectChiizu;
