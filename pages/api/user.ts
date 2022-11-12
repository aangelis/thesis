import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "lib/session";
import { NextApiRequest, NextApiResponse } from "next";

export type User = {
  id: number | null,
  email: string | null,
  username: string | null,
  first_name: string | null,
  last_name: string | null,
  isLoggedIn: boolean;
  isAdmin: boolean;
  isSecretary: boolean;
  isLibrarian: boolean;
  is_superuser: boolean;
};

export default withIronSessionApiRoute(userRoute, sessionOptions);

async function userRoute(req: NextApiRequest, res: NextApiResponse<User>) {

  if (req.session.user) {

    const roles = [
      { username: "ifigenia", isLibrarian: true  },
      { username: "tsadimas", isLibrarian: true, isSecretary: true, isAdmin: true  },
      { username: "daneli", isSecretary: true },
    ]

    const currentUserRoles = roles.find((o) => {
      return (o.username === req.session.user?.username);
    })

    const isAdmin = currentUserRoles?.isAdmin ?? false;
    const isSecretary = currentUserRoles?.isSecretary ?? false;
    const isLibrarian = currentUserRoles?.isLibrarian ?? false;

    res.json({
      ...req.session.user,
      isLoggedIn: true,
      isAdmin,
      isSecretary,
      isLibrarian,
      is_superuser: isAdmin || isSecretary || isLibrarian,
    });
  } else {
    res.json({
      id: null,
      email: null,
      username: null,
      first_name: null,
      last_name: null,
      isLoggedIn: false,
      isAdmin: false,
      isSecretary: false,
      isLibrarian: false,
      is_superuser: false,
    });
  }
}