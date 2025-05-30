import { UserButton } from '@/features/auth/components/user-button';
import React from 'react'
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { SidebarButton } from './sidebar-button';
import { BellIcon, HomeIcon, MessagesSquareIcon, MoreHorizontal } from 'lucide-react';

export const Sidebar = () => {
  return (
    <aside className="w-[70px] h-full bg-[#481349] flex \
    flex-col gap-y-4 items-center pt-[9px] pb-4">
      <WorkspaceSwitcher />
      <SidebarButton icon={HomeIcon} label="Home" isActive />
      <SidebarButton icon={MessagesSquareIcon} label="DMs" />
      <SidebarButton icon={BellIcon} label="Activity" />
      <SidebarButton icon={MoreHorizontal} label="More" />
      <div className="flex flex-col items-center justify-center gap-y-1 mt-auto">
        <UserButton />
      </div>
    </aside>
  )
};
