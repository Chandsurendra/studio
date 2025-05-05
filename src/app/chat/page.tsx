import { Laptop } from "lucide-react";
import SearchComponent from "./_components/search";

export default function ChatHomeScreen() {
	return (
		<>
			<div className="flex flex-1 flex-col items-center justify-center bg-[#222E35] text-center">
				<div className="max-w-md space-y-2">
					<Laptop className="mx-auto h-72 w-72 text-[#364147]" />
					<h2 className="font-light text-3xl text-[#E9EDEF]">Not WhatsApp</h2>
					<p className="text-[#8696A0]">Where your aunty comes to gossip.</p>
					<SearchComponent onSidebar={false} />
				</div>
			</div>
		</>
	);
}
