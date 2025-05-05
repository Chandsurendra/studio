import { useAuth } from "@clerk/nextjs";
import { Avatar } from "@radix-ui/react-avatar";
import { type Preloaded, usePreloadedQuery } from "convex/react";
import { MoreVertical, Search, Users2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { api } from "@/convex/_generated/api";
import SearchComponent from "./search";

interface SideBarProps {
	preloadedUserInfo: Preloaded<typeof api.users.readUser>;
	preloadedConversations: Preloaded<typeof api.chats.getConversation>;
}

export default function Sidebar({ preloadedUserInfo, preloadedConversations }: SideBarProps) {
	const pathname = usePathname();
	const [searchQuery, setSearchQuery] = useState("");
	const { signOut } = useAuth();
	const router = useRouter();
	const userInfo = usePreloadedQuery(preloadedUserInfo);
	const conversations = usePreloadedQuery(preloadedConversations);

	const filteredConversations = useMemo(() => {
		if (!searchQuery) return conversations;

		return conversations
			?.filter((chat) => {
				const matchesName = chat.name.toLowerCase().includes(searchQuery.toLowerCase());
				const matchesMessage = chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

				return matchesName || matchesMessage;
			})
			.sort((a, b) => {
				const aNameMatch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
				const bNameMatch = b.name.toLowerCase().includes(searchQuery.toLowerCase());

				if (aNameMatch && !bNameMatch) return -1;
				if (!aNameMatch && bNameMatch) return 1;

				return 0;
			});
	}, [searchQuery, conversations]);

	return (
		<div className="flex h-screen w-[70px] flex-col border-border border-r bg-background md:w-[380px] lg:w-1/4 dark:border-[#313D45] dark:bg-[#111B21]">
			{/* Header */}
			<div className="flex shrink-0 items-center justify-center bg-muted px-3 py-[18px] md:justify-between md:py-[14px] dark:bg-[#202C33]">
				<Link href="/profile">
					<Avatar>
						<AvatarImage
							className="h-8 w-8 rounded-full md:h-9 md:w-9"
							src={userInfo?.profileImage}
							alt="Your avatar"
						/>
					</Avatar>
				</Link>
				<div className="hidden items-center justify-center gap-2 md:flex">
					<SearchComponent onSidebar={true} />
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-10 w-10">
								<MoreVertical className="h-5 w-5" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem
								onClick={() => {
									signOut();
									router.push("/");
								}}
							>
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			{/* Search Input */}
			<div className="hidden bg-[#111B21] p-2 md:block">
				<div className="relative flex items-center rounded-lg bg-[#202C33]">
					<div className="py-2 pr-2 pl-4">
						<Search className="h-5 w-5 text-[#8696A0]" />
					</div>
					<input
						placeholder="Search"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full border-none bg-transparent py-2 text-[#E9EDEF] text-base placeholder:text-[#8696A0] focus:outline-none"
					/>
				</div>
			</div>
			{/* Conversations list */}
			<div className="flex-1 overflow-y-auto">
				{filteredConversations?.map((chat) => (
					<Link href={`/chat/${chat.id}`} key={chat.id}>
						<div
							className={`flex cursor-pointer items-center px-2 py-2 hover:bg-[#202C33] md:px-3 md:py-3 ${pathname.split("/")?.[2] === chat?.id ? "bg-[#202C33]" : ""} `}
						>
							<div className="relative">
								<Avatar>
									<AvatarImage className="h-12 w-12 rounded-full" src={chat?.chatImage} />
									<AvatarFallback className="bg-[#6B7C85]">
										<Users2 className="h-6 w-6 text-[#CFD9DF]" />
									</AvatarFallback>
								</Avatar>
							</div>
							{/* Conversation details - Only visible on md and larger screens */}
							<div className="ml-3 hidden min-w-0 flex-1 md:block">
								<div className="flex items-baseline justify-between">
									<h2 className="truncate font-normal text-[#E9EDEF] text-base">
										<HighlightText text={chat.name} searchQuery={searchQuery} />
									</h2>
									<span className="ml-2 shrink-0 text-[#8696A0] text-xs">{chat.time}</span>
								</div>
								<div className="flex items-center justify-between">
									<p className="truncate pr-2 text-[#8696A0] text-sm">
										{chat.type === "image" ? (
											<span className="flex items-center gap-1">
												<span className="text-[#8696A0]">📸</span> Photo
											</span>
										) : (
											<HighlightText text={chat.lastMessage} searchQuery={searchQuery} />
										)}
									</p>
								</div>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}

const HighlightText = ({ text, searchQuery }: { text: string; searchQuery: string }) => {
	if (!searchQuery) return <>{text}</>;

	const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));

	return (
		<>
			{parts.map((part, i) =>
				part.toLowerCase() === searchQuery.toLowerCase() ? (
					<span key={i} className="rounded bg-[#00A884] px-0.5 text-[#111B21]">
						{part}
					</span>
				) : (
					<span key={i}>{part}</span>
				),
			)}
		</>
	);
};
