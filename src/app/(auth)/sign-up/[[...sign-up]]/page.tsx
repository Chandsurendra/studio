import { SignUp } from "@clerk/nextjs";

export default function Page() {
	return (
		<div className="mt-[4rem] flex w-full flex-col items-center justify-center">
			<SignUp />
		</div>
	);
}
