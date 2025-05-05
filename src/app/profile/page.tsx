import { auth } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import ProfileComponent from "./_components/profile";

export default async function ProfilePage() {
	const { userId } = await auth();

	const preloadedUserInfo = await preloadQuery(api.users.readUser, {
		userId: userId!,
	});

	return (
		<div className="flex h-screen flex-col bg-[#111B21] text-[#E9EDEF]">
			<ProfileComponent preloadedUserInfo={preloadedUserInfo} />
		</div>
	);
}
