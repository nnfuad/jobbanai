import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CreateForm from "./CreateForm";

export default async function CreatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated — posting requires sign-in
  if (!user) {
    redirect("/login?message=Sign in to create a pitch");
  }

  return <CreateForm />;
}
