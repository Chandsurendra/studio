import { auth } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import ChatList from "../_components/chat-list";
import FormChat from "../_components/form";

export default async function Conversations({ params }: { params: Promise<{ id: string }> }) {
	const conversationId = (await params).id;
	const { userId } = await auth();

	const preloadedMessages = await preloadQuery(api.chats.getMessages, {
		conversationId: conversationId as Id<"conversations">,
	});

	return (
		<div className="flex h-screen w-full flex-col">
			<div className="flex flex-1 flex-col overflow-hidden">
				<ChatList userId={userId!} preloadedMessages={preloadedMessages} />
				<FormChat userId={userId!} conversationId={conversationId} />
			</div>
		</div>
	);
}
