"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { MoreVertical } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function Header({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	const router = useRouter();
	const { userId } = useAuth();

	const conversationId = pathname?.split("/chat/")?.[1];
	const [showDeleteAlert, setShowDeleteAlert] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Get our delete mutation
	const deleteConversation = useMutation(api.chats.deleteConversation);

	const handleDelete = async () => {
		if (!conversationId || !userId) return;

		try {
			setIsDeleting(true);
			await deleteConversation({
				userId,
				conversationId: conversationId as Id<"conversations">,
			});

			toast.success("Chat deleted successfully");
			router.push("/chat");
		} catch (error) {
			toast.error("Failed to delete chat");
			console.error("Error deleting chat:", error);
		} finally {
			setIsDeleting(false);
			setShowDeleteAlert(false);
		}
	};

	return (
		<div className="flex w-full flex-1 flex-col">
			<div className="flex items-center justify-between border-border bg-muted p-4 dark:border-[#313D45] dark:bg-[#202C33]">
				<div className="flex w-full justify-end space-x-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<MoreVertical className="h-5 w-5" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setShowDeleteAlert(true)} className="focus-text-red-500 text-red-500">
								Delete Chat
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="text-[#E9EDEF]">Delete Chat</AlertDialogTitle>
						<AlertDialogDescription className="text-[#8696A0]">
							Are you sure you want to delete this chat? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							className="bg-[#2A3942] text-[#E9EDEF] hover:bg-[#364147] hover:text-[#E9EDEF]"
							onClick={() => setShowDeleteAlert(false)}
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-red-500 text-white hover:bg-red-600"
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			{children}
		</div>
	);
}
