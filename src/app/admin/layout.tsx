import { AdminSidebar } from "./AdminSidebar";
import { headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if we're on the login page - if so, don't render admin layout
  const headersList = await headers();
  const isLoginPage = headersList.get("x-is-login-page") === "true";
  
  // If it's the login page, just return children (will use root layout only)
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Authentication is handled by middleware, so we don't need to check here
  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

