import {MongoClient, Db} from 'mongodb';

const uri: string = process.env.MONGODB_URI!;

if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables')
}

let client: MongoClient | null = null;


/**
 * A wrapper method to pass in any database name to connect to
 * and returns a MongoDB database instance
 * 
 * Automatically reuses a single MongoClient across all serverless invocations
 * to avoid exhausting database connections
 */

export async function getDb(dbName: string): Promise<Db> {
    if (!client) {
        client = new MongoClient(uri, {
            // prevents overloading one lambda with too many concurrent connections -> 
            // faster cold starts
            maxPoolSize: 10,
        });

        await client.connect();
    }

    return client.db(dbName);
}