import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<main className="items-cetner flex min-h-screen flex-col justify-center bg-[#00A884] p-4 text-white dark:bg-[#111B21]">
			<div className="space-y-6 text-center">
				<h1 className="font-bold text-4xl sm:text-5xl md:text-6xl">Welcome to Not WhatsApp</h1>
				<p className="text-white/80 text-xl md:text-2xl">It&apos;s like WhatsApp, but not... You know what we mean.</p>
				<Button
					asChild
					size="lg"
					className="bg-white text-[#00A884] hover:bg-gray-100 dark:bg-[#202C33] dark:text-white dark:hover:bg-[#2A3942]"
				>
					<Link href="/chat" className="font-semibold text-lg">
						Start Chatting
					</Link>
				</Button>
			</div>
		</main>
	);
}
