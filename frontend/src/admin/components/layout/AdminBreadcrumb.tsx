import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const breadcrumbConfig: Record<string, { title: string; parent?: string }> = {
  "/admin": { title: "Dashboard" },
  "/admin/jobs": { title: "Jobs Pending", parent: "/admin" },
  "/admin/disputes": { title: "Disputes", parent: "/admin" },
  "/admin/users": { title: "Users", parent: "/admin" },
  "/admin/transactions": { title: "Transactions", parent: "/admin" },
};

export const AdminBreadcrumb = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentConfig = breadcrumbConfig[currentPath];

  if (!currentConfig) return null;

  const breadcrumbItems = [];

  // Add parent breadcrumb if exists
  if (currentConfig.parent && breadcrumbConfig[currentConfig.parent]) {
    breadcrumbItems.push({
      href: currentConfig.parent,
      title: breadcrumbConfig[currentConfig.parent].title,
      isHome: currentConfig.parent === "/admin",
    });
  }

  // Add current page
  breadcrumbItems.push({
    href: currentPath,
    title: currentConfig.title,
    isCurrent: true,
  });

  return (
    <div className="border-b bg-muted/40 px-6 py-3">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <div key={item.href} className="flex items-center">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.isCurrent ? (
                  <BreadcrumbPage className="flex items-center gap-2">
                    {item.isHome && <Home className="h-4 w-4" />}
                    {item.title}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.href} className="flex items-center gap-2">
                      {item.isHome && <Home className="h-4 w-4" />}
                      {item.title}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
