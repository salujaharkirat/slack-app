import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { FaGithub } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { SignInFlow } from "../types"
import { useState } from "react"

interface SignInCardProps {
  setState: (state: SignInFlow) => void;
}

export const SignInCard = ({ setState }: SignInCardProps) => {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handlePasswordSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    try {
      await signIn("password", { email, password, flow: "signIn"});
    } catch (error) {
      setError("Invalid email id or password");
      console.error(error);
    } finally {
      setPending(false);
    }
  }

  const handleProviderSignIn = async (value: "github" | "google") => {
    setPending(true);
    try {
      await signIn(value);
    } catch (error) {
      console.error("sign in error", error);
    } finally {
      setPending(false);
    }
  }

  console.log("error", error);

  return (
    <Card className="w-full h-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle>
          Login to continue
        </CardTitle>
        <CardDescription>
          Use your email or another service to continue
        </CardDescription>
      </CardHeader>
      {
        !!error && (
          <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
            <TriangleAlert className="size-4"/>
            <p>{error}</p>
          </div>
        )
      }
      <CardContent className="space-y-5 px-0 pb-0">
        <form onSubmit={handlePasswordSignIn} className="space-y-2.5">
          <Input 
            disabled={pending}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required={true}
          />
          <Input 
            disabled={pending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            required={true}
          />
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={pending}
          >
            Continue
          </Button>
        </form>
        <Separator />
        <div className="flex flex-col gap-y-2.5">
          <Button
            disabled={pending}
            onClick={()=> handleProviderSignIn("google")}
            variant="outline"
            size="lg"
            className="w-full relative"
          >
            <FcGoogle className="size-5 absolute top-2.5 left-2.5" />
            Continue with Google
          </Button>
        </div>
        <div className="flex flex-col gap-y-2.5">
          <Button
            disabled={pending}
            onClick={()=> handleProviderSignIn("github")}
            variant="outline"
            size="lg"
            className="w-full relative"
          >
            <FaGithub className="size-5 absolute top-2.5 left-2.5" />
            Continue with Github
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Dont&apos;t have an account? 
          <span 
            className="text-sky-700 hover:underline cursor-pointer"
            onClick={() => setState("signUp")}
          >
            {" "}Sign up
          </span>
        </p>
      </CardContent>
    </Card>
  )
}