"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Sidebar } from "./sidebar";
import { Toolbar } from "./toolbar";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { usePanel } from "@/hooks/use-panel";
import { Id } from "../../../../convex/_generated/dataModel";
import { Thread } from "@/features/messages/components/thread";
import { Profile } from "@/features/members/components/profile";

interface WorkspaceIdLayoutProps {
  children: React.ReactNode;
}

const WorkspaceLayout  = ({ children }: WorkspaceIdLayoutProps) => {
  const { parentMessageId, profileMemberId, onClose } = usePanel();

  const showPanel = !!parentMessageId || !!profileMemberId;

  return (  
    <div className="h-full">
      <Toolbar />
      <div className="flex h-[calc(100vh-40px)]">
        <Sidebar />
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId="ca-workspace-layout"
        >
          <ResizablePanel
            defaultSize={20}
            minSize={11}
            className="bg-[#5E2C5F]"
          >
            <WorkspaceSidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={20}>
            {children}
          </ResizablePanel>
          {
            showPanel && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel minSize={20} defaultSize={29}>
                  {
                    parentMessageId ? (
                      <Thread
                        messageId={parentMessageId as Id<"messages">}
                        onClose={onClose}
                      />
                    ) : null
                  }
                  {
                    profileMemberId ? (
                      <Profile
                        memberId={profileMemberId as Id<"members">}
                        onClose={onClose}
                      />
                    ) : null
                  }

                </ResizablePanel>
              </>
            )
          }
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
 
export default WorkspaceLayout;