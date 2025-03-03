import type { Context } from '.keystone/types'

const demoUsers = [
	{
		email: 'clark@email.com',
		password: 'clark@email.com',
		subjectId: 'auth0|1234',
		name: 'Clark Kent',
		role: 'user',
	},
	{
		email: 'josh@test.com',
		password: 'josh@test.com',
		subjectId: 'auth0|60d6c72cf50319006c214d5e',
		name: 'Bruce Wayne',
		role: 'admin',
	},
	{
		email: 'diana@email.com',
		password: 'diana@email.com',
		subjectId: 'auth0|qwer',
		name: 'Diana Prince',
		role: 'user',
	},
] as const

const upsertUser = async ({
	context,
	user,
}: {
	context: Context
	user: { email: string; subjectId: string; name: string }
}) => {
	const userInDb = await context.db.User.findOne({
		where: { email: user.email },
	})
	if (userInDb) {
		return userInDb
	}

	return context.db.User.createOne({ data: user })
}

export const seedDemoData = (context: Context) => {
	const sudoContext = context.sudo()
	return Promise.all(
		demoUsers.map((u) => upsertUser({ context: sudoContext, user: u }))
	)
}
