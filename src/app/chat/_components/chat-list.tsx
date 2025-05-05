"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { useEffect, useRef } from "react";
import type { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";

interface Message {
	content: string;
	id: Id<"messages">;
	isSent: boolean;
	sender: string;
	sender_userId: string | undefined;
	time: string;
	type: "text" | "image" | "video" | "audio" | "file";
	mediaUrl?: string;
}

export default function ChatList({
	userId,
	preloadedMessages,
}: {
	userId: string;
	preloadedMessages: Preloaded<typeof api.chats.getMessages>;
}) {
	const messages = usePreloadedQuery(preloadedMessages);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div
			ref={containerRef}
			className="max-h-[calc(100vh-135px)] flex-1 overflow-y-auto bg-background dark:bg-[#0B141A]"
			style={{
				msOverflowStyle: "none",
				scrollbarWidth: "none",
				WebkitOverflowScrolling: "touch",
			}}
		>
			<div className="flex min-h-full flex-col space-y-4 p-4">
				{messages.map((message: Message) => {
					const isMyMessage = message.sender_userId === userId;

					return (
						<div key={message.id} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
							<div
								className={`max-w-xs rounded-lg p-3 lg:max-w-md ${
									isMyMessage ? "bg-primary text-primary-foreground dark:bg-[#005C4B]" : "bg-muted dark:bg-[#202C33]"
								} `}
							>
								{!isMyMessage && <p className="mb-1 text-muted-foreground text-xs dark:text-white">{message.sender}</p>}

								{message?.type === "image" ? (
									<div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
										<div className="w-full">
											<Image
												src={message.mediaUrl!}
												alt="Message content"
												className="h-auto max-h-[300px] w-full rounded-lg object-contain"
												sizes="(max-width: 640px) 100vw, (max-width: 768px) 75vw, (max-width: 1024px) 50vw, 33vw"
												onLoad={() => {
													messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
												}}
											/>
										</div>
									</div>
								) : (
									<p className="whitespace-pre-wrap break-words text-sm dark:text-white">{message.content}</p>
								)}

								<p className="mt-1 text-right text-muted-foreground text-xs">{message.time}</p>
							</div>
						</div>
					);
				})}
				<div ref={messagesEndRef} />
			</div>
		</div>
	);
}
