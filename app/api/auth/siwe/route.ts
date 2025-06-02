import { SiweMessage } from "siwe";
import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import { ironOptions } from "@/lib/auth/session";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getIronSession(req, res, ironOptions);

  switch (req.method) {
    case "POST": {
      try {
        const { message, signature } = req.body;
        const siwe = new SiweMessage(message);
        const fields = await siwe.validate(signature);

        session.siwe = fields;
        await session.save();
        res.status(200).json({ ok: true });
      } catch (error) {
        res.status(400).json({ error: "Invalid signature" });
      }
      break;
    }

    case "GET": {
      if (!session.siwe) {
        res.status(401).json({ authenticated: false });
      } else {
        res
          .status(200)
          .json({ authenticated: true, address: session.siwe.address });
      }
      break;
    }

    case "DELETE": {
      session.destroy();
      res.status(200).json({ ok: true });
      break;
    }

    default:
      res.setHeader("Allow", ["POST", "GET", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
