"use client";
import { fetchMutation } from "convex/nextjs";
import { type Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { ArrowLeft, Camera, Edit2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";

interface ProfileFormData {
	name: string;
}

export default function ProfileComponent({
	preloadedUserInfo,
}: {
	preloadedUserInfo: Preloaded<typeof api.users.readUser>;
}) {
	const router = useRouter();
	const [isEditing, setIsEditing] = useState(false);
	const userInfo = usePreloadedQuery(preloadedUserInfo);
	const updateUserMutation = useMutation(api.users.updateName);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: userInfo?.name || "",
		},
	});

	const onSubmit = async (data: ProfileFormData) => {
		try {
			if (userInfo?.userId) {
				await updateUserMutation({
					userId: userInfo.userId,
					name: data.name,
				});

				setIsEditing(false);

				router.refresh();
			} else {
				console.error("User Id is undefined");
			}
		} catch (error) {
			console.error(error);
		}
	};

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e?.target?.files?.[0];

		if (!file) return;

		try {
			const reader = new FileReader();
			reader.onloadend = () => {
				//
			};
			reader.readAsDataURL(file);

			const postUrl = await fetchMutation(api.chats.generateUploadUrl);

			const result = await fetch(postUrl, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			});

			if (!result.ok) {
				throw new Error(`Upload failed: ${result.statusText}`);
			}

			const { storageId } = await result.json();

			const url = await fetchMutation(api.chats.getUploadUrl, {
				storageId,
			});

			if (url && userInfo?.userId) {
				await fetchMutation(api.users.updateProfileImage, {
					userId: userInfo?.userId,
					profileImage: url,
				});
			}
		} catch (error) {
			console.error("Upload failed:", error);
		}
	};

	console.log("userInfo", userInfo);
	return (
		<>
			<header className="flex items-center bg-[#202C33] p-4">
				<Link href="/chat">
					<Button variant="ghost" size="icon" className="mr-4">
						<ArrowLeft className="h-6 w-6 text-[#00A884]" />
					</Button>
				</Link>
				<h1 className="font-normal text-xl">Profile</h1>
			</header>

			<div className="flex-1 overflow-y-auto">
				<div className="flex flex-col items-center p-4">
					<div className="relative mb-6">
						<Avatar className="h-40 w-40">
							<AvatarImage src={userInfo?.profileImage} alt={userInfo?.name || ""} />
							<AvatarFallback>{userInfo?.name}</AvatarFallback>
						</Avatar>
						<label
							htmlFor="profile-image"
							className="absolute right-0 bottom-0 cursor-pointer rounded-full bg-[#00A884] p-2"
						>
							<Camera className="h-6 w-6 text-[#111B21]" />
							<input id="profile-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
						</label>
					</div>

					<div className="w-full max-w-md space-y-4">
						<div className="rounded-lg bg-[#202C33] p-4">
							<Label htmlFor="name" className="text-[#8696A0] text-sm">
								Name
							</Label>
							{isEditing ? (
								<form onSubmit={handleSubmit(onSubmit)} className="mt-1 flex items-center gap-2">
									<Input
										{...register("name", {
											required: true,
										})}
										className="border-none bg-transparent text-[#E9EDEF] focus-visible:ring-0"
										autoFocus
										onBlur={() => {
											handleSubmit(onSubmit);
										}}
									/>
									<Button type="submit" size="sm" className="bg-[#00A884] hover:bg-[#00957B]">
										Save
									</Button>
								</form>
							) : (
								<div className="mt-1 flex items-center justify-between">
									<span className="text-[#E9EDEF]">{userInfo?.name}</span>
									<Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
										<Edit2 className="h-5 w-5 text-[#00A884]" />
									</Button>
								</div>
							)}
							{errors.name && <span className="mt-1 text-red-500 text-sm">Name is required</span>}
						</div>
						<div className="rounded-lg bg-[#202C33] p-4">
							<Label className="text-[#8696A0] text-sm">Email</Label>
							<div className="mt-1 text-[#E9EDEF]">{userInfo?.email}</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
