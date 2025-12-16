import { createYoga, createSchema } from 'graphql-yoga';
import { YogaContext } from '../src/types/yogaContext';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../src/db/mongo';

import { diningHallType } from '../src/schema/diningHallType';
import { reviewType } from '../src/schema/reviewType';
import { queryType } from '../src/schema/queryType';
import { menuItemType } from '../src/schema/menuItemType';

import { queryResolvers } from '../src/resolvers/queries';
import { mutationType } from '../src/schema/mutationType';
import { mutationResolvers } from '../src/resolvers/mutations';
import { authResolvers } from '../src/resolvers/auth';
import { menuItemResolvers } from '../src/resolvers/menuItemResolvers';

import { verifyAccessToken } from '../src/auth/jwt';
import { parse } from 'cookie';
import { authType } from '../src/schema/authType';

// Combine all type definitions into a single schema
const typeDefs = [diningHallType, reviewType, queryType, authType, mutationType, menuItemType];
const resolvers = [queryResolvers, mutationResolvers, authResolvers, menuItemResolvers];
const schema = createSchema<YogaContext>({ typeDefs, resolvers })

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
    schema,
    graphqlEndpoint: '/api/graphql',
    maskedErrors: false,

    context: async ({req, res}) => {
        const db = await getDb('ratemydininghall-ucsd');

        const cookies = parse(req.headers.cookie ?? '');
        const access = cookies['access_token'];

        let user: YogaContext['user'] = null;
        if (access) {
            try {
                user = verifyAccessToken(access)
            } catch {
                user = null;
            }
        }
        return { req, res, db, user };
    }
});

/**
 * Request hits /api/graphql 
 * => vercel creates req/res objects 
 * => passes them to the yoga instance 
 * => yoga handles the request (parses GraphQL query, runs resolvers, and writes JSON back)
 * => Vercel returns the response
 */
export default (req: VercelRequest, res: VercelResponse) => yoga(req, res);