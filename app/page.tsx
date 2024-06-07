import { ChatForm } from "@/components/ChatForm";
import { Messages } from "@/components/Messages";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export default async function Page() {
  return (
    <main className="max-w-screen-lg flex flex-col mx-auto border-l border-r h-screen">
      <Messages />
      <div className="mt-auto">
        <ChatForm />
      </div>
    </main>
  );
}
