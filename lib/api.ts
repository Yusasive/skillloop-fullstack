import axios from "axios";

export async function fetchTokenBalance(address: string) {
  const res = await axios.get(`/api/faucet?address=${address}`);
  return res.data.balance;
}

export async function fetchUserProfile(address: string) {
  const res = await axios.get(`/api/profile?address=${address}`);
  return res.data.profile;
}

export async function fetchUserSessions(address: string) {
  const res = await axios.get(`/api/session?address=${address}`);
  return res.data.sessions;
}
