"use client";
/**
 * Shared portal shell in the classic Atlassian (Confluence / Jira) layout:
 *  - a dark-blue global rail (logo, search, create / notifications, theme,
 *    help, account),
 *  - a light-grey contextual sidebar (portal tile + grouped icon navigation),
 *  - a white page canvas with breadcrumbs.
 * Search, Create and Notifications open as left drawers. Every role's shell
 * (super admin, staff, instructor, student, organization) renders through this.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  CircleHelp,
  KeyRound,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Sun,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Icon = LucideIcon;
export type NavChild = {
  label: string;
  href: string;
  icon?: Icon;
  isActive?: (path: string) => boolean;
};
export type NavItem = {
  label: string;
  icon: Icon;
  href?: string;
  exact?: boolean;
  children?: NavChild[];
  badge?: "messages";
  isActive?: (path: string) => boolean;
};
export type NavGroup = { label: string; items: NavItem[] };
export type CreateLink = { label: string; href: string; icon?: Icon };
type Notification = { id: string; title: string; url: string; date: string };
type DrawerKind = "search" | "create" | "notifications";

const matches = (path: string, href: string, exact = false) =>
  path === href || (!exact && path.startsWith(`${href}/`));

const itemActive = (path: string, item: NavItem): boolean =>
  item.isActive
    ? item.isActive(path)
    : item.href
      ? matches(path, item.href, item.exact)
      : !!item.children?.some((child) => childActive(path, child));

const childActive = (path: string, child: NavChild) =>
  child.isActive ? child.isActive(path) : matches(path, child.href);

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

const titleCase = (slug: string) =>
  slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

function useDismiss(
  open: boolean,
  close: () => void,
  refs: React.RefObject<HTMLElement>[],
) {
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      const inside = refs.some((ref) => ref.current?.contains(event.target as Node));
      if (!inside) close();
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, close]);
}

export function Avatar({
  name,
  src,
  size = 32,
}: {
  name: string;
  src?: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size, fontSize: Math.max(11, size * 0.38) };
  if (src && !failed)
    return (
      <img
        src={src}
        alt=""
        onError={() => setFailed(true)}
        style={style}
        className="shrink-0 rounded-full object-cover"
      />
    );
  return (
    <span
      aria-hidden
      style={style}
      className="grid shrink-0 place-items-center rounded-full bg-[#FF8B00] font-semibold text-white"
    >
      {initials(name)}
    </span>
  );
}

async function signOut() {
  await fetch("/api/login-history", { method: "DELETE", keepalive: true }).catch(
    () => {},
  );
  await createClient().auth.signOut();
  localStorage.removeItem("bgsb-last-activity");
  location.href = "/login";
}

/** Round icon button on the blue rail / mobile bar. */
function RailButton({
  label,
  onClick,
  href,
  active,
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  active?: boolean;
  children: ReactNode;
}) {
  const className = `ds-rail-btn relative grid size-10 place-items-center rounded-full text-[#DEEBFF] transition-colors hover:bg-white/15 hover:text-white ${active ? "bg-white/20 text-white" : ""}`;
  if (href)
    return (
      <Link href={href} aria-label={label} title={label} className={className}>
        {children}
      </Link>
    );
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-expanded={active}
      className={className}
    >
      {children}
    </button>
  );
}

export function AppShell({
  homeHref,
  portalLabel,
  user,
  groups,
  createLinks = [],
  accountLinks,
  wrapContent,
  children,
}: {
  homeHref: string;
  portalLabel: string;
  user: { name: string; subtitle: string; avatar?: string | null };
  groups: NavGroup[];
  createLinks?: CreateLink[];
  accountLinks?: { profile: string; password: string };
  wrapContent?: (content: ReactNode) => ReactNode;
  children: ReactNode;
}) {
  const path = usePathname() || "";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [drawer, setDrawer] = useState<DrawerKind | null>(null);
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const mobileAccountRef = useRef<HTMLDivElement>(null);
  const closeAccount = useCallback(() => setAccountOpen(false), []);
  useDismiss(accountOpen, closeAccount, [accountRef, mobileAccountRef]);

  // Persisted preferences.
  useLayoutEffect(() => {
    try {
      setCollapsed(localStorage.getItem("bgsb-sidebar-collapsed") === "1");
      const saved = localStorage.getItem("bgsb-admin-theme");
      setDark(
        saved
          ? saved === "dark"
          : document.documentElement.classList.contains("admin-dark"),
      );
    } catch {}
    setThemeReady(true);
  }, []);
  useEffect(() => {
    if (!themeReady) return;
    try {
      localStorage.setItem("bgsb-admin-theme", dark ? "dark" : "light");
      localStorage.setItem("bgsb-sidebar-collapsed", collapsed ? "1" : "0");
    } catch {}
    document.documentElement.classList.toggle("admin-dark", dark);
  }, [dark, collapsed, themeReady]);

  useEffect(() => {
    setMobileOpen(false);
    setDrawer(null);
    setAccountOpen(false);
  }, [path]);
  useEffect(() => {
    const lock = mobileOpen || drawer !== null;
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, drawer]);

  // Keyboard: "/" opens search, Escape closes drawers.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawer(null);
        setMobileOpen(false);
        return;
      }
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setQuery("");
        setDrawer("search");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Live counters (same endpoints the previous shells polled).
  useEffect(() => {
    let active = true;
    const refresh = () =>
      fetch("/api/admin/notifications", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => active && setNotifications(data.items || []))
        .catch(() => {});
    refresh();
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener("notifications-read", refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("notifications-read", refresh);
    };
  }, [path]);
  useEffect(() => {
    let active = true;
    const refresh = () =>
      fetch("/api/admin/messages/unread", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => active && setUnread(data.count || 0))
        .catch(() => {});
    refresh();
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener("messages-read", refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("messages-read", refresh);
    };
  }, [path]);

  function markRead(ids: string[]) {
    if (!ids.length) return;
    setNotifications((rows) => rows.filter((row) => !ids.includes(row.id)));
    fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids }),
      keepalive: true,
    }).catch(() => {});
  }

  // Flat list of every destination, for the search drawer and help lookup.
  const destinations = useMemo(() => {
    const rows: { label: string; href: string; icon: Icon; group: string; parent?: string }[] = [];
    for (const group of groups)
      for (const item of group.items) {
        if (item.href)
          rows.push({ label: item.label, href: item.href, icon: item.icon, group: group.label });
        for (const child of item.children || [])
          rows.push({
            label: child.label,
            href: child.href,
            icon: child.icon || item.icon,
            group: group.label,
            parent: item.label,
          });
      }
    return rows;
  }, [groups]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return destinations;
    return destinations.filter((row) =>
      `${row.label} ${row.parent || ""} ${row.group}`.toLowerCase().includes(q),
    );
  }, [destinations, query]);

  const helpHref = useMemo(
    () =>
      destinations.find((row) => row.href.includes("/support/help"))?.href ||
      destinations.find((row) => row.href.includes("/support"))?.href,
    [destinations],
  );

  // Breadcrumbs: Portal / Section / Page, using nav labels where possible.
  const crumbs = useMemo(() => {
    const labels = new Map<string, string>();
    for (const row of destinations) labels.set(row.href, row.label);
    const parts = path.replace(homeHref, "").split("/").filter(Boolean);
    const trail: { label: string; href: string }[] = [
      { label: portalLabel, href: homeHref },
    ];
    let href = homeHref;
    for (const part of parts) {
      href += `/${part}`;
      const isId = /^[0-9a-f-]{16,}$/i.test(part) || /^\d+$/.test(part);
      trail.push({
        label: labels.get(href) || (isId ? "Details" : titleCase(part)),
        href,
      });
    }
    return trail;
  }, [path, destinations, homeHref, portalLabel]);

  const openDrawer = (kind: DrawerKind) => {
    setAccountOpen(false);
    setMobileOpen(false);
    if (kind === "search") setQuery("");
    setDrawer((current) => (current === kind ? null : kind));
  };

  const unreadBadge = notifications.length > 9 ? "9+" : String(notifications.length);

  /* ---------------------------------------------------------------- Sidebar */
  const sidebar = (
    <aside
      aria-label={`${portalLabel} navigation`}
      className="ds-sidenav flex h-full w-full flex-col bg-[#F4F5F7]"
    >
      <div className="flex shrink-0 items-center gap-3 px-4 pb-3 pt-5">
        <Link
          href={homeHref}
          className="-m-1 flex min-h-10 min-w-0 flex-1 items-center rounded-[3px] px-2 py-1 hover:bg-[#EBECF0]"
        >
          <span className="min-w-0 leading-tight">
            <b className="block truncate text-sm font-semibold text-[#172B4D]">BGSB LMS</b>
            <span className="block truncate text-xs text-[#6B778C]">{portalLabel} portal</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          className="grid size-8 place-items-center rounded-[3px] text-[#42526E] hover:bg-[#EBECF0] lg:hidden"
        >
          <X className="size-4" />
        </button>
      </div>

      <nav className="ds-scroll flex-1 overflow-y-auto px-2 pb-6">
        {groups.map((group, groupIndex) => (
          <div key={group.label} className={groupIndex ? "mt-5" : "mt-2"}>
            {groupIndex > 0 && (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#6B778C]">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const ItemIcon = item.icon;
                const active = itemActive(path, item);
                const badge =
                  item.badge === "messages" && unread > 0
                    ? unread > 99
                      ? "99+"
                      : String(unread)
                    : null;
                const base =
                  "ds-nav-item flex h-10 w-full items-center gap-3 rounded-[3px] px-3 text-[14px] transition-colors";
                const tone = active
                  ? "ds-nav-selected bg-[#EBECF0] font-medium text-[#0052CC]"
                  : "text-[#42526E] hover:bg-[#EBECF0] hover:text-[#172B4D]";

                if (item.children?.length) {
                  const open = openMenus[item.label] ?? active;
                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() =>
                          setOpenMenus((menus) => ({ ...menus, [item.label]: !open }))
                        }
                        className={`${base} ${active && !open ? tone : active ? "font-medium text-[#172B4D] hover:bg-[#EBECF0]" : "text-[#42526E] hover:bg-[#EBECF0] hover:text-[#172B4D]"}`}
                      >
                        <ItemIcon aria-hidden className="size-5 shrink-0" />
                        <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                        <ChevronDown
                          aria-hidden
                          className={`size-4 shrink-0 text-[#6B778C] transition-transform ${open ? "" : "-rotate-90"}`}
                        />
                      </button>
                      {open && (
                        <ul className="mb-1 mt-0.5 space-y-0.5">
                          {item.children.map((child) => {
                            const on = childActive(path, child);
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  aria-current={on ? "page" : undefined}
                                  className={`ds-nav-item flex h-9 items-center rounded-[3px] pl-11 pr-3 text-[14px] transition-colors ${on ? "ds-nav-selected bg-[#EBECF0] font-medium text-[#0052CC]" : "text-[#42526E] hover:bg-[#EBECF0] hover:text-[#172B4D]"}`}
                                >
                                  <span className="truncate">{child.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href || "#"}
                      aria-current={active ? "page" : undefined}
                      className={`${base} ${tone}`}
                    >
                      <ItemIcon aria-hidden className="size-5 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {badge && (
                        <span className="rounded-full bg-[#0052CC] px-1.5 text-[11px] font-semibold leading-[18px] text-white">
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );

  /* ------------------------------------------------------------ Account menu */
  const accountMenu = (placement: string) => (
    <div
      role="menu"
      className={`ds-popover absolute z-[220] w-64 rounded-[3px] bg-white py-1.5 shadow-overlay ${placement}`}
    >
      <div className="flex items-center gap-3 px-4 py-2.5">
        <Avatar name={user.name} src={user.avatar} size={36} />
        <span className="min-w-0">
          <b className="block truncate text-sm font-semibold text-[#172B4D]">{user.name}</b>
          <span className="block truncate text-xs text-[#6B778C]">{user.subtitle}</span>
        </span>
      </div>
      <div className="my-1 border-t border-[#DFE1E6]" />
      {accountLinks && (
        <>
          <Link
            role="menuitem"
            href={accountLinks.profile}
            className="flex h-9 items-center gap-2.5 px-4 text-sm text-[#172B4D] hover:bg-[#091E420F]"
          >
            <UserRound className="size-4 text-[#42526E]" />
            Profile
          </Link>
          <Link
            role="menuitem"
            href={accountLinks.password}
            className="flex h-9 items-center gap-2.5 px-4 text-sm text-[#172B4D] hover:bg-[#091E420F]"
          >
            <KeyRound className="size-4 text-[#42526E]" />
            Change password
          </Link>
        </>
      )}
      <button
        type="button"
        role="menuitem"
        onClick={() => setDark((value) => !value)}
        className="flex h-9 w-full items-center gap-2.5 px-4 text-sm text-[#172B4D] hover:bg-[#091E420F]"
      >
        {dark ? (
          <Sun className="size-4 text-[#42526E]" />
        ) : (
          <Moon className="size-4 text-[#42526E]" />
        )}
        {dark ? "Light theme" : "Dark theme"}
      </button>
      <div className="my-1 border-t border-[#DFE1E6]" />
      <button
        type="button"
        role="menuitem"
        onClick={signOut}
        className="flex h-9 w-full items-center gap-2.5 px-4 text-sm text-[#172B4D] hover:bg-[#091E420F]"
      >
        <LogOut className="size-4 text-[#42526E]" />
        Log out
      </button>
    </div>
  );

  /* ----------------------------------------------------------------- Drawers */
  const drawerTitle =
    drawer === "search" ? "Search" : drawer === "create" ? "Create" : "Notifications";
  const drawerPanel = drawer && (
    <>
      <button
        aria-label="Close panel"
        onClick={() => setDrawer(null)}
        className="fixed inset-0 z-[200] cursor-default bg-[#091E427D]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={drawerTitle}
        className="ds-drawer fixed inset-y-0 left-0 z-[210] flex w-[min(560px,100vw)] bg-white shadow-overlay"
      >
        <div className="flex w-16 shrink-0 flex-col items-center pt-4">
          <button
            type="button"
            onClick={() => setDrawer(null)}
            aria-label="Close"
            className="grid size-10 place-items-center rounded-full text-[#42526E] hover:bg-[#091E420F] hover:text-[#172B4D]"
          >
            <ArrowLeft className="size-5" />
          </button>
        </div>
        <div className="flex min-w-0 flex-1 flex-col pr-4 pt-5 sm:pr-8">
          {drawer === "search" && (
            <>
              <label className="relative block">
                <span className="sr-only">Search the portal</span>
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && searchResults[0]) {
                      location.assign(searchResults[0].href);
                    }
                  }}
                  placeholder={`Search ${portalLabel.toLowerCase()} portal`}
                  className="ds-bare h-12 w-full border-0 border-b-2 border-[#DFE1E6] bg-transparent pr-2 text-2xl font-medium text-[#172B4D] outline-none placeholder:text-[#97A0AF] focus:border-[#4C9AFF]"
                />
              </label>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#6B778C]">
                {query.trim() ? `${searchResults.length} results` : "Pages in this portal"}
              </p>
              <ul className="ds-scroll -mx-2 mt-2 flex-1 overflow-y-auto pb-6">
                {searchResults.map((row) => {
                  const RowIcon = row.icon;
                  return (
                    <li key={row.href + row.label}>
                      <Link
                        href={row.href}
                        className="flex items-center gap-3 rounded-[3px] px-2 py-2 hover:bg-[#EBECF0]"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-[3px] bg-[#DEEBFF] text-[#0052CC]">
                          <RowIcon aria-hidden className="size-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-[#172B4D]">
                            {row.label}
                          </span>
                          <span className="block truncate text-xs text-[#6B778C]">
                            {row.parent ? `${row.group} · ${row.parent}` : row.group}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
                {!searchResults.length && (
                  <li className="px-2 py-10 text-center text-sm text-[#6B778C]">
                    Nothing matches “{query}”.
                  </li>
                )}
              </ul>
            </>
          )}

          {drawer === "create" && (
            <>
              <h2 className="text-2xl font-medium text-[#172B4D]">Create</h2>
              <p className="mt-1 text-sm text-[#6B778C]">Start something new in the {portalLabel.toLowerCase()} portal.</p>
              <ul className="ds-scroll -mx-2 mt-5 flex-1 overflow-y-auto pb-6">
                {createLinks.map((link) => {
                  const LinkIcon = link.icon || Plus;
                  return (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-3 rounded-[3px] px-2 py-2.5 hover:bg-[#EBECF0]"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-[3px] bg-[#DEEBFF] text-[#0052CC]">
                          <LinkIcon aria-hidden className="size-[18px]" />
                        </span>
                        <span className="text-sm font-medium text-[#172B4D]">{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {drawer === "notifications" && (
            <>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-medium text-[#172B4D]">Notifications</h2>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => markRead(notifications.map((n) => n.id))}
                    className="text-sm font-medium text-[#0052CC] hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <ul className="ds-scroll -mx-2 mt-4 flex-1 overflow-y-auto pb-6">
                {notifications.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.url}
                      onClick={() => markRead([item.id])}
                      className="flex gap-3 rounded-[3px] px-2 py-3 hover:bg-[#EBECF0]"
                    >
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#0052CC]" />
                      <span className="min-w-0">
                        <span className="line-clamp-2 text-sm text-[#172B4D]">{item.title}</span>
                        <span className="mt-0.5 block text-xs text-[#6B778C]">
                          {new Date(item.date).toLocaleString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
                {!notifications.length && (
                  <li className="px-2 py-16 text-center">
                    <Bell className="mx-auto size-8 text-[#97A0AF]" />
                    <p className="mt-3 text-base font-medium text-[#172B4D]">You&apos;re all caught up</p>
                    <p className="text-sm text-[#6B778C]">New notifications will appear here.</p>
                  </li>
                )}
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  );

  const content = <>{children}</>;
  const sidebarWidth = collapsed ? "lg:pl-16" : "lg:pl-[304px]";

  return (
    <div
      data-admin-shell
      className={`min-h-screen max-w-full overflow-x-clip ${dark ? "admin-dark" : ""}`}
    >
      <a
        href="#main-content"
        className="sr-only z-[300] rounded-[3px] bg-white px-3 py-2 text-sm font-medium text-[#0052CC] shadow-overlay focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>

      {/* Global rail (desktop) */}
      <div className="ds-rail fixed inset-y-0 left-0 z-[190] hidden w-16 flex-col items-center bg-[#0747A6] py-4 text-white lg:flex">
        <Link
          href={homeHref}
          aria-label="BGSB LMS home"
          title="BGSB LMS home"
          className="mb-4 grid size-10 place-items-center overflow-hidden rounded-[3px] bg-white p-0.5"
        >
          <img src="/bgs logo.png" alt="" className="size-full object-contain" />
        </Link>
        <div className="flex flex-col items-center gap-1.5">
          <RailButton label="Search (/)" onClick={() => openDrawer("search")} active={drawer === "search"}>
            <Search className="size-5" />
          </RailButton>
          {createLinks.length > 0 && (
            <RailButton label="Create" onClick={() => openDrawer("create")} active={drawer === "create"}>
              <Plus className="size-6" strokeWidth={2.25} />
            </RailButton>
          )}
        </div>
        <div className="mt-auto flex flex-col items-center gap-1.5">
          <RailButton
            label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </RailButton>
          <span aria-hidden className="my-1 h-px w-8 bg-white/20" />
          <RailButton
            label={`Notifications${notifications.length ? ` (${notifications.length} unread)` : ""}`}
            onClick={() => openDrawer("notifications")}
            active={drawer === "notifications"}
          >
            <Bell className="size-5" />
            {notifications.length > 0 && (
              <span className="absolute right-0.5 top-0.5 grid min-w-4 place-items-center rounded-full bg-[#DE350B] px-1 text-[10px] font-bold leading-4 text-white">
                {unreadBadge}
              </span>
            )}
          </RailButton>
          <RailButton
            label={dark ? "Switch to light theme" : "Switch to dark theme"}
            onClick={() => setDark((value) => !value)}
          >
            {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </RailButton>
          {helpHref && (
            <RailButton label="Help" href={helpHref}>
              <CircleHelp className="size-5" />
            </RailButton>
          )}
          <div ref={accountRef} className="relative mt-1">
            <button
              type="button"
              aria-label="Your profile and settings"
              title={user.name}
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen((value) => !value)}
              className="grid size-10 place-items-center rounded-full hover:bg-white/15"
            >
              <Avatar name={user.name} src={user.avatar} size={32} />
            </button>
            {accountOpen && accountMenu("bottom-0 left-14")}
          </div>
        </div>
      </div>

      {/* Contextual sidebar (desktop) */}
      <div
        className={`fixed inset-y-0 left-16 z-40 hidden transition-[width] duration-200 lg:block ${collapsed ? "w-0" : "w-60"}`}
      >
        <div className={`h-full overflow-hidden ${collapsed ? "invisible" : ""}`}>
          <div className="h-full w-60 border-r border-[#DFE1E6]">{sidebar}</div>
        </div>
      </div>

      {/* Mobile top bar */}
      <header className="ds-rail sticky top-0 z-30 flex h-14 items-center gap-1 bg-[#0747A6] px-2 text-white lg:hidden">
        <RailButton label="Open navigation" onClick={() => setMobileOpen(true)}>
          <Menu className="size-5" />
        </RailButton>
        <Link href={homeHref} className="flex min-w-0 flex-1 items-center gap-2 px-1">
          <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-[3px] bg-white p-0.5">
            <img src="/bgs logo.png" alt="" className="size-full object-contain" />
          </span>
          <span className="truncate text-sm font-semibold">BGSB LMS</span>
        </Link>
        <RailButton label="Search" onClick={() => openDrawer("search")}>
          <Search className="size-5" />
        </RailButton>
        {createLinks.length > 0 && (
          <RailButton label="Create" onClick={() => openDrawer("create")}>
            <Plus className="size-5" />
          </RailButton>
        )}
        <RailButton label="Notifications" onClick={() => openDrawer("notifications")}>
          <Bell className="size-5" />
          {notifications.length > 0 && (
            <span className="absolute right-0.5 top-0.5 grid min-w-4 place-items-center rounded-full bg-[#DE350B] px-1 text-[10px] font-bold leading-4 text-white">
              {unreadBadge}
            </span>
          )}
        </RailButton>
        <div ref={mobileAccountRef} className="relative">
          <button
            type="button"
            aria-label="Your profile and settings"
            aria-expanded={accountOpen}
            onClick={() => setAccountOpen((value) => !value)}
            className="grid size-10 place-items-center rounded-full hover:bg-white/15"
          >
            <Avatar name={user.name} src={user.avatar} size={28} />
          </button>
          {accountOpen && accountMenu("right-0 top-11 text-left")}
        </div>
      </header>

      {mobileOpen && (
        <>
          <button
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-[#091E427D] lg:hidden"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] shadow-overlay lg:hidden">
            {sidebar}
          </div>
        </>
      )}

      {drawerPanel}

      <div className={`min-w-0 transition-[padding] duration-200 ${sidebarWidth}`}>
        <main
          id="main-content"
          className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-5 sm:px-8 sm:py-6 lg:px-10 lg:py-7"
        >
          <nav aria-label="Breadcrumb" className="mb-3 min-w-0">
            <ol className="flex min-w-0 flex-wrap items-center gap-x-1 text-sm text-[#6B778C]">
              {crumbs.map((crumb, index) => {
                const last = index === crumbs.length - 1;
                return (
                  <li key={crumb.href} className="flex min-w-0 items-center gap-1">
                    {index > 0 && <span aria-hidden className="px-0.5 text-[#97A0AF]">/</span>}
                    {last ? (
                      <span aria-current="page" className="truncate text-[#6B778C]">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link href={crumb.href} className="truncate text-[#6B778C] hover:text-[#0052CC] hover:underline">
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
          {wrapContent ? wrapContent(content) : content}
        </main>
      </div>
    </div>
  );
}
