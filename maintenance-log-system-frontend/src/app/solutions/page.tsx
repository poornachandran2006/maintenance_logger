import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SolutionsMainPage from "./SolutionsMainPage";

export default async function SolutionsPage() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  // 🔥 If no token → redirect instantly (NO FLASH)
  if (!token) {
    redirect("/signin");
  }

  return <SolutionsMainPage />;
}
