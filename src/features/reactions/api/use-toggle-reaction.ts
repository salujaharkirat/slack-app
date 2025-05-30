import { useCallback, useMemo, useState } from "react";
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel";

type Options = {
  onSuccess?: (data: ResponseType) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  shouldThrowError?: boolean;
};

type RequestType = {
  value: string;
  messageId: Id<"messages">;
};

type ApiStatusType = "success" | "pending" | "settled" | "error" | "idle";

type ResponseType = Id<"reactions"> | null;

export const useToggleReaction = () => {
  const [data, setData] = useState<ResponseType>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<ApiStatusType>("idle");

  const isPending = useMemo(() => status === "pending", [status]);
  const isSuccess = useMemo(() => status === "success", [status]);
  const isError = useMemo(() => status === "error", [status]);
  const isSettled = useMemo(() => status === "settled", [status]);


  const mutation = useMutation(api.reactions.toggle);
  const mutate = useCallback(async(values: RequestType, options?: Options) => {
    try {
      setData(null);
      setError(null);
      setStatus("pending");
      const response = await mutation(values);
      options?.onSuccess?.(response);
      return response;
    } catch(error) {
      setStatus("error");
      options?.onError?.(error as Error);
      if (options?.shouldThrowError) {
        throw error;
      }
    } finally {
      setStatus("settled");
      options?.onSettled?.();
    }
  }, [mutation]);

  return { 
    mutate,
    data,
    error,
    isPending,
    isSettled,
    isSuccess,
    isError,
  };

}