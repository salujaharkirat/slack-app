import Link from "next/link";

import { Button } from "@/components/ui/button"
import { Id } from "../../../../convex/_generated/dataModel";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const userItemVariants = cva(
  "flex items-center gap-1.5 justify-start px-1.5 font-normal h-7 text-sm overflow-hidden",
  {
    variants: {
      variant: {
        default: "text-[#f9edffcc]",
        active: "text-[#481349] bg-white/90 hover:bg-white/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface UserItemProps {
  id?: Id<"members">;
  label?: string;
  image?: string;
  variant?: VariantProps<typeof userItemVariants>["variant"];
}

export const UserItem = ({
  id,
  label,
  image,
  variant
}: UserItemProps) => {
  const workspaceId = useWorkspaceId();
  const avatarFallback = label?.charAt(0).toUpperCase();

  return (
    <Button
      variant={"transparent"}
      className={cn(userItemVariants({ variant }))}
      size="sm"
      asChild
    >
      <Link href={`/workspace/${workspaceId}/member/${id}`}>
        <Avatar className="size-5 rounded-sm mr-1">
          <AvatarImage className="rounded-sm" src={image} />
          <AvatarFallback className="rounded-sm bg-sky-500 text-white text-xs">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm truncate">{label}</span>
      </Link>
    </Button>
  )
}