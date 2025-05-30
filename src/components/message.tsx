import dynamic from "next/dynamic";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { format, isToday, isYesterday } from "date-fns";
import { Hint } from "./hint";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Thumbnail } from "./thumbnail";
import { Toolbar } from "./toolbar";
import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRemoveMessage } from "@/features/messages/api/use-remove-message";
import { useConfirm } from "@/hooks/use-confirm";
import { useToggleReaction } from "@/features/reactions/api/use-toggle-reaction";
import { Reactions } from "./reactions";
import { usePanel } from "@/hooks/use-panel";
import { ThreadBar } from "./thread-bar";

const MessageRenderer  = dynamic(() => import("@/components/message-renderer"), {ssr: false});
const Editor = dynamic(() => import("@/components/editor"), {ssr: false});

interface MessageProps  {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[]
    }
  >;
  body: Doc<"messages">["body"];
  image?: string | null;
  updatedAt: Doc<"messages">["updatedAt"];
  createdAt: Doc<"messages">["_creationTime"];
  isEditing: boolean;
  isCompact?: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadTimestamp?: number;
  threadName?: string;
};

const formatFullTime = (date: Date) => {
  return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm:ss a")}`
}

export const Message =({
  id,
  memberId,
  authorImage,
  authorName = "Member",
  isAuthor,
  reactions,
  body,
  image,
  createdAt,
  updatedAt,
  isEditing,
  isCompact,
  setEditingId,
  hideThreadButton,
  threadCount,
  threadImage,
  threadTimestamp,
  threadName,
}: MessageProps) => {
  const { parentMessageId, onOpenMessage, onOpenProfile, onClose } = usePanel();
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete message?",
    "Are you sure you want to delete this message? This cannot be undone."
  );

  const { mutate: updateMessage, isPending: isUpdatingMessage } = useUpdateMessage();
  const { mutate: removeMessage, isPending: isRemovingMessage } = useRemoveMessage();
  const { mutate: toggleReaction, isPending: isTogglingReaction } = useToggleReaction();
  
  const isPending = isUpdatingMessage || isRemovingMessage || isTogglingReaction;

  const handleReaction = (value: string) => {
    toggleReaction({ messageId: id, value } , {
      onError: () => {
        toast.error("Failed to toggle reaction");
      }
    })
  }

  const handleUpdate = ({ body }: {body: string}) => {
    updateMessage({ id, body}, {
      onSuccess: () => {
        toast.success("Updated message");
        setEditingId(null);
      },
      onError: () => {
        toast.error("Failed to update message");
      }
    })
  };

  const handleRemove = async () => {
    const ok = await confirm();

    if (!ok) {
      return;
    }

    removeMessage({ id }, {
      onSuccess: () => {
        toast.success("Message deleted");
        if (parentMessageId === id) {
          onClose();
        }
      },
      onError: () => {
        toast.error("Failed to delete message");
      }
    })
  }


  if (isCompact) {
    return (
      <>
        <ConfirmDialog />
        <div className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
          isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
          isRemovingMessage && 
            "bg-rose-500/50 transorm transition-all scale-y-0 origin-bottom duration-200"
          )}>
          <div className="flex items-start gap-2">
            <Hint label={formatFullTime(new Date(createdAt))}>
              <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                {format(createdAt, "hh:mm")}
              </button>
            </Hint>
            {isEditing ? (
              <div className="w-full h-full">
                <Editor 
                  onSubmit={handleUpdate}
                  disabled={isPending}
                  defaultValue={JSON.parse(body)}
                  onCancel={() => setEditingId(null)}
                  variant="update"
                />
              </div>
            ) : (
              <div className="flex flex-col w-full">
                <MessageRenderer value={body} />
                <Thumbnail url={image} />
                {updatedAt ? (
                  <span className="text-xs text-muted-foreground">
                    (edited)
                  </span>
              ): null}
              <Reactions 
                data={reactions}
                onChange={handleReaction}
              />
              <ThreadBar 
                count={threadCount}
                image={threadImage}
                timestamp={threadTimestamp}
                name={threadName}
                onClick={() => onOpenMessage(id)}
              />
            </div>)}
          </div>
          {!isEditing && (
            <Toolbar
              isAuthor={isAuthor}
              isPending={false}
              handleEdit={() => setEditingId(id)}
              handleThread={() => onOpenMessage(id)}
              handleDelete={handleRemove}
              handleReaction={handleReaction}
              hideThreadButton={hideThreadButton}
            />
          )}
        </div>      
      </>

    );
  }

  const avatarFallback = authorName?.charAt(0).toUpperCase();

  return (
    <>
      <ConfirmDialog />
      <div className={cn(
        "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
        isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
        isRemovingMessage && 
            "bg-rose-500/50 transorm transition-all scale-y-0 origin-bottom duration-200"
        )}>
        <div className="flex items-start gap-2">
          <button onClick={() => onOpenProfile(memberId)}>
            <Avatar className="rounded-md">
              <AvatarImage src={authorImage} />
              <AvatarFallback className="rounded-sm bg-sky-500 text-white text-xs">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </button>
          {isEditing ? (
            <div className="w-full h-full">
              <Editor 
                onSubmit={handleUpdate}
                disabled={isPending}
                defaultValue={JSON.parse(body)}
                onCancel={() => setEditingId(null)}
                variant="update"
              />
              </div>
          ): (
          <div className="flex flex-col w-full overflow-hidden">
            <div className="text-sm">
              <button 
                className="font-bold text-primary hover:underline"
                onClick={() => onOpenProfile(memberId)}
              >
                {authorName}
              </button>
              <span>&nbsp;</span>
              <Hint label={formatFullTime(new Date(createdAt))}>
                <button className="text-xs text-muted-foreground hover:underline">
                  {format(new Date(createdAt), "h:mm a")}
                </button>
              </Hint>
            </div>
            <MessageRenderer value={body} />
            <Thumbnail url={image} />
            {updatedAt ? 
              <span className="text-xs text-muted-foreground">(Edited)</span>
              : null
            }
            <Reactions 
              data={reactions}
              onChange={handleReaction}
            />
            <ThreadBar 
              count={threadCount}
              image={threadImage}
              timestamp={threadTimestamp}
              onClick={() => onOpenMessage(id)}
              name={threadName}
            />
          </div>
          )}
        </div>
        {!isEditing && (
          <Toolbar
            isAuthor={isAuthor}
            isPending={isPending}
            handleEdit={() => setEditingId(id)}
            handleThread={() => onOpenMessage(id)}
            handleDelete={handleRemove}
            handleReaction={handleReaction}
            hideThreadButton={hideThreadButton}
          />
        )}
      </div>
    </>

  );
};

