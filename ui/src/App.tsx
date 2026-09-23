import { useState } from "react";
import AppLayout from "@cloudscape-design/components/app-layout";
import SideNavigation, { type SideNavigationProps } from "@cloudscape-design/components/side-navigation";
import Overview from "./pages/Overview";
import Tools from "./pages/Tools";

type Page = "overview" | "tools";

const NAV_ITEMS: SideNavigationProps["items"] = [
  { type: "link", text: "Overview", href: "#overview" },
  { type: "link", text: "Tools", href: "#tools" },
];

export default function App() {
  const [page, setPage] = useState<Page>("overview");

  return (
    <AppLayout
      navigationHide={false}
      toolsHide
      navigation={
        <SideNavigation
          header={{ text: "Frank", href: "#overview" }}
          activeHref={`#${page}`}
          items={NAV_ITEMS}
          onFollow={(event) => {
            event.preventDefault();
            setPage(event.detail.href === "#tools" ? "tools" : "overview");
          }}
        />
      }
      content={page === "overview" ? <Overview /> : <Tools />}
    />
  );
}
