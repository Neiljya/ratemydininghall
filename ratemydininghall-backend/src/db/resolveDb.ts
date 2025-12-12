//**
//  Currently rmdh only supports UCSD campus, but if more were to be added in future
// this is the logic that we would use to resolve the database names for each campus
//

import { VercelRequest } from "@vercel/node";
import type { Db } from "mongodb";
import { getDb } from "./mongo";

// */
const CAMPUS_DB_MAP: Record<string, string> = {
    ucsd: 'ratemydininghall-ucsd',
    // ucla: 'ratemydininghall-ucla',
}

export function resolveDbNameFromCampus(campusRaw: unknown): string {
    const campus = String(campusRaw ?? '').toLowerCase().trim();

    if (!campus) {
        return process.env.MONGODB_DB_NAME ?? 'ratemydininghall-ucsd';
    }

    const dbName = CAMPUS_DB_MAP[campus];
    if (!dbName) {
        throw new Error(`Unrecognized campus identifier: ${campus}`);
    }

    return dbName;
}

export async function getCampusDb(req: VercelRequest): Promise<Db> {
    const campus = req.headers['x-campus'];

    const dbName = resolveDbNameFromCampus(campus);
    return getDb(dbName);
}