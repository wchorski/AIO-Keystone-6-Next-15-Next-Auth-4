import { getContext } from '@keystone-6/core/context'
import config from '../../keystone'
import { unstable_getServerSession } from 'next-auth/next'
import { authOptions } from '../pages/api/auth/[...nextauth]'
import * as PrismaModule from '.prisma/client'
import { Context } from '.keystone/types'
import { NextApiRequest, NextApiResponse } from 'next/types'

// Making sure multiple prisma clients are not created during hot reloading
export const keystoneContext: Context =
	(globalThis as any).keystoneContext || getContext(config, PrismaModule)

if (process.env.NODE_ENV !== 'production')
	(globalThis as any).keystoneContext = keystoneContext

export async function getSessionContext(props?: {
	req: NextApiRequest
	res: NextApiResponse
}) {
	let session = null
	if (props) {
		const { req, res } = props
		session = await unstable_getServerSession(req, res, authOptions)
	}
	// running in the app directory, so we don't need to pass req and res
	else session = await unstable_getServerSession(authOptions)
	return keystoneContext.withSession(session)
}
