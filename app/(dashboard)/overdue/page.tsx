import { redirect } from "next/navigation";
export default function OverdueRedirect() {
  redirect("/today");
}
