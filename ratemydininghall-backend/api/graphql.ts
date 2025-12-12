import { createYoga, createSchema } from 'graphql-yoga';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Db } from 'mongodb';

import { getDb } from '../src/db/mongo';

import { diningHallType } from '../src/schema/diningHallType';
import { reviewType } from '../src/schema/reviewType';
import { queryType } from '../src/schema/queryType';
import { queryResolvers } from '../src/resolvers/queries';
import { mutationType } from '../src/schema/mutationType';
import { mutationResolvers } from '../src/resolvers/mutations';

// Combine all type definitions into a single schema
const typeDefs = [diningHallType, reviewType, queryType, mutationType];
const resolvers = [queryResolvers, mutationResolvers];

type YogaContext = {
    req: VercelRequest;
    res: VercelResponse;
    db: Db;
}
/**
 * Creates the graphQL server instance
 * 
 * Any file inside api/ is a serverless function, any request
 * that hits /api/graphql => Vercel creates HTTP request object => returns it
 * back to the function
 * 
 * Yoga automatically parses the request, validates the query against
 * the schema, and executes it against the resolvers
 * 
 * The function then returns the result of the query back to the client
 * 
 * Note: we don't have any resolvers yet, so the queries will return null
 * for now
 * 
 * In production, when deployed to vercel, it will automatically read from 
 * its environment 
 */
const yoga = createYoga<YogaContext>({
    schema: createSchema({ typeDefs, resolvers }),
    graphqlEndpoint: '/api/graphql',
    maskedErrors: false,

    context: async ({req, res}) => {
        const db = await getDb('ratemydininghall-ucsd');
        return { req, res, db };
    }
});

/**
 * Request hits /api/graphql 
 * => vercel creates req/res objects 
 * => passes them to the yoga instance 
 * => yoga handles the request (parses GraphQL query, runs resolvers, and writes JSON back)
 * => Vercel returns the response
 */
export default yoga;