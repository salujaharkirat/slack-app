"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Dialog, DialogHeader, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useCreateWorkspace } from "../api/use-create-workspace";
import { useCreateWorkspaceModal } from "../store/use-create-workspace-modal";


export const CreateWorkspaceModal = () => {
  const router = useRouter();
  const [open, setOpen] = useCreateWorkspaceModal();
  const [name, setName] = useState("");
  const { mutate, isPending } = useCreateWorkspace();

  const handleClose = () => {
    setOpen(false);
    setName("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate({ name }, {
      onSuccess: (id) => {
        router.replace(`/workspace/${id}`);
        handleClose();
        toast.success("Workspace created");
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add a workspace
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input 
            disabled={isPending}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            minLength={3}
            placeholder="Workspace name e.g. 'Work', 'Personal', 'Home'"
          />
          <div className="flex justify-end">
            <Button
              disabled={isPending}
            >
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}