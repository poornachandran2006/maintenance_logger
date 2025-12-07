import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FeaturesClient from "./FeaturesClient";

export default async function FeaturesPage() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  // 🔥 If user is NOT logged in → redirect instantly (NO FLASH)
  if (!token) {
    redirect("/signin");
  }

  return <FeaturesClient />;
}
