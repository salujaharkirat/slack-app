"use client";

import { useCreateOrGetConversation } from "@/features/conversations/api/use-create-or-get-conversation";
import { useMemberId } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { AlertTriangleIcon, Loader } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Conversation } from "./conversation";


const MemberIdPage = () => {
  const memberId = useMemberId();
  const workspaceId = useWorkspaceId();

  const {data, mutate, isPending } = useCreateOrGetConversation();

  useEffect(() => {
    mutate({
      workspaceId,
      memberId
    }, {
      onError: () => {
        toast.error("Failed to create or get conversation");
      }
    });
  }, [memberId, workspaceId, mutate]);

  if (isPending) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <AlertTriangleIcon className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Conversation not found
        </span>
      </div>
    )
  }

  return <Conversation conversationId={data} />
}

export default MemberIdPage;
