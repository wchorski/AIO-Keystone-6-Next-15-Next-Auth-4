// import { withAuth } from "next-auth/middleware"

// export default withAuth(
//   // `withAuth` augments your `Request` with the user's token.
//   {
//     callbacks: {
//       authorized: ({token}) => {
//         console.log(token);
//         return true
//       },
//       // authorized: ({ token }) => token?.role === "admin",
//     },
//   }
// )

// export const config = { matcher: ["/admin"] }