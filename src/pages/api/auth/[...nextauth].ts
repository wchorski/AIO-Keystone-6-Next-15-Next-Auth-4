import NextAuth from "next-auth"
import Auth0 from "next-auth/providers/auth0"
import { keystoneContext } from "../../../keystone/context"
import CredentialProvider from "next-auth/providers/credentials"

export const authOptions = {
	callbacks: {
		async signIn({ user }: any) {
			const keyUser = await keystoneContext.sudo().db.User.findOne({
				where: { subjectId: user.id },
			})
			if (!keyUser) {
				console.log("user not found, creating one")
				await keystoneContext.sudo().db.User.createOne({
					data: {
						subjectId: user.id,
						email: user.email,
						name: user.name,
					},
				})
			}
			return true
		},
		async session({ session, token }: any) {
			const { id, name, email, role } = token
			return { ...session, data: { id, name, email, role } }
		},
		async jwt({ token, user }: any) {
			const userInDb = await keystoneContext.sudo().query.User.findOne({
				where: { subjectId: token.sub },
				query: "id name email role",
			})
			if (user) {
				token = { ...token, ...user }
			}
			if (userInDb) {
				token = { ...token, ...userInDb }
			}

			return token
		},
	},
	providers: [
		// Auth0({
		// 	clientId: process.env.AUTH0_CLIENT_ID || "Auth0ClientID",
		// 	clientSecret: process.env.AUTH0_CLIENT_SECRET || "Auth0ClientSecret",
		// 	issuer:
		// 		process.env.AUTH0_ISSUER_BASE_URL || "https://opensaas.au.auth0.com",
		// }),
		// ...add more providers here
		CredentialProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email", placeholder: "name@mail.com" },
				password: {
					label: "Password",
					type: "password",
					placeholder: "******",
				},
			},
			authorize: async (credentials: any, req: any) => {
				if (!credentials.email && !credentials.password && !credentials)
					console.log("!!! insufficent credentials")

				//todo create a `login-count` variable on a user to track how many successful logins?

				const sudoContext = await keystoneContext.sudo()
				// check if the user exists in keystone
				const data = (await sudoContext.graphql.run({
					query: `
            query Users($where: UserWhereInput!) {
              users(where: $where) {
                name
                email
                role
                password
              }
            }
          `,
					variables: {
						where: {
							email: {
								equals: credentials.email,
								mode: "insensitive",
							},
						},
					},
				})) as { users: any[] }
				const foundUser = data.users[0]
				// const foundUser = await sudoContext.query.User.findOne({
				// 	where: { email: credentials?.email },
				// 	query: userQuery,
				// })
				//? for debuging only
				// .then(data => {
				//   console.log('### query.User.findOne: );
				//   console.log({data})
				// }).catch(error => {
				//   console.log({error})
				// })

				// unauthorized
				if (!foundUser) {
					console.log("!!! Credentials: no foundUser found in db")
					return null
				}

				if (!foundUser.password) {
					console.log("!!! no password set for User")
					return null
				}

				// const match = (credentials?.password === foundUser.password)
				const isPasswordMatch = credentials.password === foundUser.password

				// const isPasswordMatch = await bcrypt.compare(
				// 	credentials?.password,
				// 	foundUser.password
				// )
				// if(!match) return {status: 401, message: 'incorrect password'}

				//? proper way to compair strings in case insensative manor. but do i even need it?
				// if (isPasswordMatch && (credentials.email.localeCompare(foundUser.email, undefined, { sensitivity: 'base' }) === 0)) {
				if (isPasswordMatch) {
					console.log("### user is authenticated, ", foundUser.email)
					return {
						_type: "credentials",
						id: foundUser.id,
						authId: foundUser.email,
						role: foundUser.role,
						email: foundUser.email,
						user: {
							id: foundUser.id,
							name: foundUser.name,
							email: foundUser.email,
							image: foundUser.image,
							stripeCustomerId: foundUser.stripeCustomerId,
						},
					}
				}

				// login failed catch all
				console.log("!!!!! login no work for, ", credentials?.email)
				return null
			},
		}),
	],
}

export default NextAuth(authOptions)
