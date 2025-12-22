import AuthForm from "@/components/AuthForm";

// const Page = () => {
//   return <AuthForm type="sign-up" />;
// };
import { redirect } from "next/navigation";

const Page = () => {
  // Automatically move users to the sign-in page
  redirect("/sign-in");

  // This part won't render
  return null;
};

export default Page;

