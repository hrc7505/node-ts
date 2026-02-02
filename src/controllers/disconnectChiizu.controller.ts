import { Request, Response } from "express";
import { log } from "node:console";

const disconnectChiizu = async (req: Request, res: Response) => {
    log("disconnect-chiizu headers::", req.headers);
    log("disconnect-chiizu body::", req.body);

    res.status(201).json({
        isDisconnected: true,
    });
};

export default disconnectChiizu;
