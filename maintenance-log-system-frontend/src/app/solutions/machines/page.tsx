import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MachinesClientPage from "./MachinesClientPage";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/signin");
  }

  return <MachinesClientPage />;
}
