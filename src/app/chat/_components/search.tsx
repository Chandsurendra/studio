"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import debounce from "lodash/debounce";
import { ArrowLeft, MessageSquareMore, Search, Users2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";

export default function SearchComponent({ onSidebar }: { onSidebar: boolean }) {
	const { userId } = useAuth();
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [debouncedTerm, setDebouncedTerm] = useState<string>("");
	const [isOpen, setIsOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	const createConversation = useMutation(api.chats.createOrGetConversation);

	const debouncedSearch = useCallback(
		// Debounce function that delays executing the search
		debounce((term: string) => {
			// startTransition allows React to prioritize urgent updates
			startTransition(() => {
				// Update the search term after a delay
				setDebouncedTerm(term);
			});
		}, 300),
		[],
	);

	const searchResults = useQuery(api.users.searchUsers, {
		searchTerm: debouncedTerm,
		currentUserId: userId || "",
	});

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchTerm(value);
		debouncedSearch(value);
	};

	const handleStartChat = async (selectedUserId: string) => {
		try {
			const conversationId = await createConversation({
				participantUserId: selectedUserId,
				currentUserId: userId!,
			});

			setIsOpen(false);
			router.push(`/chat/${conversationId}`);
		} catch (error) {
			console.error("Error creating conversation " + error);
		}
	};

	// Prepare skeleton items for loading state
	const SkeletonItem = () => (
		<div className="flex animate-pulse items-center px-4 py-3">
			<div className="mr-3 h-12 w-12 rounded-full bg-[#202C33]" />
			<div className="flex-1">
				<div className="mb-2 h-4 w-1/3 rounded bg-[#202C33]" />
				<div className="h-3 w-1/2 rounded bg-[#202C33]" />
			</div>
		</div>
	);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				{onSidebar ? (
					<Button variant="ghost" size="icon">
						<MessageSquareMore className="h-5 w-5" />
					</Button>
				) : (
					<div className="mt-5">
						<Button className="bg-[#00A884] text-[#111B21] hover:bg-[#02906f]">Bother Somebody</Button>
					</div>
				)}
			</DialogTrigger>
			<DialogTitle />
			<DialogContent className="w-full max-w-[380px] border-[#313D45] bg-[#111B21] p-0">
				<DialogHeader className="p-0">
					{/* Header */}
					<div className="flex items-center gap-4 bg-[#202C33] p-4">
						<Button
							variant="ghost"
							size="icon"
							className="text-[#AEBAC1] hover:text-white"
							onClick={() => setIsOpen(false)}
						>
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<h2 className="font-medium text-[#E9EDEF] text-base">New Chat</h2>
					</div>

					{/* Search Input */}
					<div className="bg-[#111B21] p-2">
						<div className="relative flex items-center rounded-lg bg-[#202C33]">
							<div className="py-2 pr-2 pl-4">
								<Search className="h-5 w-5 text-[#8696A0]" />
							</div>
							<input
								value={searchTerm}
								onChange={handleSearchChange}
								placeholder="Search Contacts"
								className="w-full border-none bg-transparent py-2 text-[#E9EDEF] text-base placeholder:text-[#8696A0] focus:outline-none"
							/>
						</div>
					</div>

					{/* Results with fixed height container */}
					<div className="max-h-[400px] min-h-[300px] overflow-y-auto">
						{isPending ? (
							<>
								<SkeletonItem />
								<SkeletonItem />
								<SkeletonItem />
							</>
						) : (
							<>
								{searchResults?.map((user) => (
									<div
										key={user.userId}
										onClick={() => handleStartChat(user.userId)}
										className="flex cursor-pointer items-center px-4 py-3 transition-colors hover:bg-[#202C33]"
									>
										<Avatar className="mr-3 h-12 w-12">
											<AvatarImage src={user.profileImage} />
											<AvatarFallback className="bg-[#6B7C85]">
												<Users2 className="h-6 w-6 text-[#CFD9DF]" />
											</AvatarFallback>
										</Avatar>
										<div className="min-w-0 flex-1">
											<h3 className="truncate font-normal text-[#E9EDEF] text-base">{user.name}</h3>
										</div>
									</div>
								))}
								{searchResults?.length === 0 && debouncedTerm && (
									<div className="p-4 text-center text-[#8696A0]">No contacts found</div>
								)}

								{!debouncedTerm && (
									<div className="px-4 py-8 text-center">
										<p className="text-[#8696A0] text-sm">Search for users to start a new chat</p>
									</div>
								)}
							</>
						)}
					</div>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
