"use client";
import {
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  FolderLock,
  LayoutDashboard,
  LifeBuoy,
  ListTree,
  Megaphone,
  MessageSquare,
  Radio,
  ScrollText,
  Ticket,
  Users,
} from "lucide-react";
import { AppShell, type CreateLink, type NavGroup } from "./portal/app-shell";
import { roleLabels, type Role } from "@/lib/types";

function instructorNav(base: string): NavGroup[] {
  return [
    {
      label: "Overview",
      items: [{ label: "Dashboard", icon: LayoutDashboard, href: base, exact: true }],
    },
    {
      label: "Teaching",
      items: [
        { label: "My courses", icon: BookOpen, href: `${base}/my-courses` },
        { label: "Curriculum", icon: ListTree, href: `${base}/curriculum` },
        { label: "Assignments", icon: ClipboardList, href: `${base}/assignments` },
        { label: "My students", icon: Users, href: `${base}/my-students` },
        { label: "Certificates", icon: Award, href: `${base}/certificates` },
        { label: "Live classes", icon: Radio, href: `${base}/live-classes` },
      ],
    },
    {
      label: "Communication",
      items: [
        { label: "Calendar", icon: CalendarDays, href: `${base}/calendar` },
        { label: "Announcements", icon: Megaphone, href: `${base}/announcements` },
        { label: "Messages", icon: MessageSquare, href: `${base}/messages`, badge: "messages" },
      ],
    },
    {
      label: "Workspace",
      items: [
        { label: "Private files", icon: FolderLock, href: `${base}/private-files` },
        { label: "Reports", icon: BarChart3, href: `${base}/reports` },
        {
          label: "Support",
          icon: LifeBuoy,
          children: [
            { label: "Help & support", href: `${base}/support/help` },
            { label: "Tickets", href: `${base}/support/tickets` },
            { label: "FAQ", href: `${base}/support/faq` },
          ],
        },
        { label: "Terms & conditions", icon: ScrollText, href: `${base}/terms-and-conditions` },
      ],
    },
  ];
}

function studentNav(base: string): NavGroup[] {
  return [
    {
      label: "Overview",
      items: [{ label: "Dashboard", icon: LayoutDashboard, href: base, exact: true }],
    },
    {
      label: "Learning",
      items: [
        { label: "My courses", icon: BookOpen, href: `${base}/courses` },
        { label: "Curriculum", icon: ListTree, href: `${base}/curriculum` },
        { label: "Assignments", icon: ClipboardList, href: `${base}/assignments` },
        { label: "Quizzes", icon: CircleHelp, href: `${base}/quiz` },
        { label: "Certificates", icon: Award, href: `${base}/certificates` },
        { label: "Reports", icon: BarChart3, href: `${base}/reports` },
      ],
    },
    {
      label: "Communication",
      items: [
        { label: "Announcements", icon: Megaphone, href: `${base}/announcements` },
        { label: "Messages", icon: MessageSquare, href: `${base}/messages`, badge: "messages" },
        { label: "Meetings", icon: Radio, href: `${base}/meetings` },
        { label: "Calendar", icon: CalendarDays, href: `${base}/calendar` },
      ],
    },
    {
      label: "Workspace",
      items: [
        { label: "Private files", icon: FolderLock, href: `${base}/private-files` },
        {
          label: "Support",
          icon: LifeBuoy,
          children: [
            { label: "Help & support", href: `${base}/support/help` },
            { label: "Tickets", href: `${base}/support/tickets` },
            { label: "FAQ", href: `${base}/support/faq` },
          ],
        },
        { label: "Terms & conditions", icon: ScrollText, href: `${base}/terms-and-conditions` },
      ],
    },
  ];
}

function organizationNav(base: string): NavGroup[] {
  return [
    {
      label: "Overview",
      items: [{ label: "Dashboard", icon: LayoutDashboard, href: base, exact: true }],
    },
  ];
}

const createFor: Partial<Record<Role, (base: string) => CreateLink[]>> = {
  student: (base) => [
    { label: "Assignment submission", href: `${base}/assignments`, icon: ClipboardList },
    { label: "Support ticket", href: `${base}/support/tickets/new`, icon: Ticket },
    { label: "Private file", href: `${base}/private-files`, icon: FolderLock },
    { label: "Appointment", href: `${base}/calendar`, icon: CalendarDays },
  ],
  instructor: (base) => [
    { label: "Assignment", href: `${base}/assignments`, icon: ClipboardList },
    { label: "Live class", href: `${base}/live-classes`, icon: Radio },
    { label: "Announcement", href: `${base}/announcements`, icon: Megaphone },
    { label: "Support ticket", href: `${base}/support/tickets`, icon: Ticket },
  ],
};

export function DashboardShell({
  role,
  name,
  email,
  avatar,
  children,
}: {
  role: Role;
  name: string;
  email?: string | null;
  avatar?: string | null;
  children: React.ReactNode;
}) {
  const base = `/dashboard/${role.replace("_", "-")}`;
  const groups =
    role === "instructor"
      ? instructorNav(base)
      : role === "student"
        ? studentNav(base)
        : organizationNav(base);
  const hasAccountPages = role === "instructor" || role === "student";
  return (
    <AppShell
      homeHref={base}
      portalLabel={roleLabels[role]}
      user={{
        name,
        subtitle: role === "student" && email ? email : roleLabels[role],
        avatar: avatar || "/api/account/avatar",
      }}
      groups={groups}
      createLinks={createFor[role]?.(base) || []}
      accountLinks={
        hasAccountPages
          ? { profile: `${base}/profile`, password: `${base}/change-password` }
          : undefined
      }
    >
      {children}
    </AppShell>
  );
}
