import { IronSessionOptions } from "iron-session";

export const ironOptions: IronSessionOptions = {
  cookieName: "siwe-session",
  password: process.env.SESSION_PASSWORD as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

declare module "iron-session" {
  interface IronSessionData {
    siwe?: {
      address: string;
      chainId: number;
    };
  }
}
