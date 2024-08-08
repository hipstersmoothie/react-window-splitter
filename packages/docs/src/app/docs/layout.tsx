import Link from "next/link";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { IconLink } from "../../Components/IconButton";
import { Tooltip, TooltipTrigger } from "../../Components/Tooltip";
import { SidebarGroup, SidebarItem } from "../../Components/Sidebar";

function Header() {
  return (
    <div className="flex items-center justify-between px-4 h-14">
      <Link href="/">
        <h1
          className="
          font-black font-mono text-gray-normal text-sm
          bg-gray-action
          rounded px-2 py-0.5
        "
        >
          react-window-splitter
        </h1>
      </Link>

      <TooltipTrigger>
        <IconLink
          href="https://github.com/hipstersmoothie/react-window-splitter"
          aria-label="Open repo on GitHub"
          target="_blank"
        >
          <GitHubLogoIcon />
        </IconLink>
        <Tooltip>Open repo on GitHub</Tooltip>
      </TooltipTrigger>
    </div>
  );
}

async function Sidebar() {
  return (
    <div className="w-64 flex flex-col gap-6 py-2 px-2 flex-shrink-0 sticky top-0 self-start max-h-screen overflow-y-auto">
      <SidebarGroup>
        <SidebarItem path="/docs/install">Install</SidebarItem>
      </SidebarGroup>
      <SidebarGroup title="Examples">
        <SidebarItem path="/docs/examples/simple">Simple</SidebarItem>
        <SidebarItem path="/docs/examples/collapsible">Collapsible</SidebarItem>
        <SidebarItem path="/docs/examples/nested">Nested</SidebarItem>
        <SidebarItem path="/docs/examples/conditional">
          Conditional Panels
        </SidebarItem>
        <SidebarItem path="/docs/examples/persistance">Persistance</SidebarItem>
      </SidebarGroup>
      <SidebarGroup title="API Docs">
        <SidebarItem path="/docs/api/panel-group">PanelGroup</SidebarItem>
        <SidebarItem path="/docs/api/panel">Panel</SidebarItem>
        <SidebarItem path="/docs/api/panel-resizer">PanelResizer</SidebarItem>
      </SidebarGroup>
      <SidebarGroup title="Thanks">
        <SidebarItem path="/docs/api/prior-art">Prior Art</SidebarItem>
      </SidebarGroup>
    </div>
  );
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        {children}
      </div>
    </div>
  );
}
