import dynamic from "next/dynamic";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { format, isToday, isYesterday } from "date-fns";
import { Hint } from "./hint";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Thumbnail } from "./thumbnail";

const MessageRenderer  = dynamic(() => import("@/components/message-renderer"), {ssr: false});

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
};

const formatFullTime = (date: Date) => {
  return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm:ss a")}`
}

export const Message =({
  // id,
  // memberId,
  authorImage,
  authorName = "Member",
  // isAuthor,
  // reactions,
  body,
  image,
  createdAt,
  updatedAt,
  // isEditing,
  isCompact,
  // setEditingId,
  // hideThreadButton,
  // threadCount,
  // threadImage,
  // threadTimestamp,
}: MessageProps) => {
  const avatarFallback = authorName?.charAt(0).toUpperCase();

  if (isCompact) {
    return (
      <div className="flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative">
        <div className="flex items-start gap-2">
          <Hint label={formatFullTime(new Date(createdAt))}>
            <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
              {format(createdAt, "hh:mm")}
            </button>
          </Hint>
          <div className="flex flex-col w-full">
            <MessageRenderer value={body} />
            <Thumbnail url={image} />
           {updatedAt ? (
              <span className="text-xs text-muted-foreground">
                (edited)
              </span>
           ): null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative">
      <div className="flex items-start gap-2">
        <button>
          <Avatar className="rounded-md">
            <AvatarImage src={authorImage} />
            <AvatarFallback className="rounded-sm bg-sky-500 text-white text-xs">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </button>
        <div className="flex flex-col w-full overflow-hidden">
          <div className="text-sm">
            <button className="font-bold text-primary hover:underline">
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
        </div>
      </div>
    </div>
  );
};

