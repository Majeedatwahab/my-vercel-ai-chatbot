import { relations } from "drizzle-orm/relations";
import { user, chat, reservation } from "./schema";

export const chatRelations = relations(chat, ({one}) => ({
	user: one(user, {
		fields: [chat.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	chats: many(chat),
	reservations: many(reservation),
}));

export const reservationRelations = relations(reservation, ({one}) => ({
	user: one(user, {
		fields: [reservation.userId],
		references: [user.id]
	}),
}));