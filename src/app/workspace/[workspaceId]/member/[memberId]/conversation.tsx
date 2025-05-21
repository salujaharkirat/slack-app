import { useMemberId } from "@/hooks/use-member-id";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { useGetMember } from "@/features/members/api/use-get-member";
import { Loader } from "lucide-react";
import { Header } from "./header";
import { ChatInput } from "./chat-input";
import { MessageList } from "@/components/message-list";

interface ConversationProps {
  conversationId: Id<"conversations">;
}

export const Conversation = ({ conversationId }: ConversationProps) => {
  const memberId = useMemberId();
  const {data: member, isLoading: memberLoading} = useGetMember({ id: memberId });
  const {results, status, loadMore } = useGetMessages({
    conversationId,
  });

  if (memberLoading || status === "LoadingFirstPage") {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="Size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  return (
    <div className="flex flex-col h-full">
      <Header
        memberName={member?.user.name}
        memberImage={member?.user.image}
        onClick={() => {}}
      />
      <MessageList 
        data={results}
        variant="conversation"
        memberName={member?.user.name}
        memberImage={member?.user.image}
        loadMore={loadMore}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />
      <ChatInput 
        placeholder={`Message ${member?.user.name}`}
        conversationId={conversationId}
      />
    </div>
  )
}