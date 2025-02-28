import { pgTable, uuid, varchar, foreignKey, timestamp, json, boolean } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"




export const user = pgTable("User", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 64 }).notNull(),
	password: varchar({ length: 64 }),
});

export const chat = pgTable("Chat", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	messages: json().notNull(),
	userId: uuid().notNull(),
},
(table) => {
	return {
		chatUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Chat_userId_User_id_fk"
		}),
	}
});

export const reservation = pgTable("Reservation", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	details: json().notNull(),
	hasCompletedPayment: boolean().default(false).notNull(),
	userId: uuid().notNull(),
},
(table) => {
	return {
		reservationUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Reservation_userId_User_id_fk"
		}),
	}
});