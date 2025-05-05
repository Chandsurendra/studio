import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { api } from "./_generated/api";

const http = httpRouter();

const clerkWebhook = httpAction(async (ctx, request) => {
	const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
	if (!webhookSecret) {
		throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
	}

	const svix_id = request.headers.get("svix-id");
	const svix_signature = request.headers.get("svix-signature");
	const svix_timestamp = request.headers.get("svix-timestamp");

	if (!svix_id || !svix_signature || !svix_timestamp) {
		return new Response("Error occurred -- no svix headers", {
			status: 400,
		});
	}

	const payload = await request.json();
	const body = JSON.stringify(payload);
	const headers = {
		"svix-id": svix_id,
		"svix-timestamp": svix_timestamp,
		"svix-signature": svix_signature,
	};

	const wh = new Webhook(webhookSecret);
	let evt: WebhookEvent;

	try {
		evt = wh.verify(body, headers) as WebhookEvent;
	} catch (err) {
		console.error("Error verifying webhook:", err);
		return new Response("Error occurred", { status: 400 });
	}

	const eventType = evt.type;

	if (eventType === "user.created") {
		const { id, email_addresses, first_name, last_name, image_url  } = evt.data;
		const email = email_addresses[0]?.email_address;
		const name = `${first_name || ""} ${last_name || ""}`.trim();
		const profileImage = image_url

		try {
			await ctx.runMutation(api.users.createUser, {
				email,
				name,
				userId: id,
				createdAt: Date.now(),
				profileImage
			});
		} catch (error) {
			console.error("Error creating user in Convex", error);
			return new Response("Error creating user", { status: 500 });
		}
	}
	return new Response("Webhook processed successfully", { status: 200 });
});

http.route({
	path: "/clerk-webhook",
	method: "POST",
	handler: clerkWebhook,
});

export default http;
