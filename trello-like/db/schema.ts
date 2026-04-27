import { pgTable, text, integer, timestamp, boolean, jsonb, uuid, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
id: uuid('id').primaryKey(),
email: text('email').notNull().unique(),
password: text('password').notNull(),
name: text('name').notNull(),
createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
});

export const boards = pgTable('boards', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id),
});

export const lists = pgTable('lists', {
  id: uuid('id').primaryKey(),
  title: text('title').notNull(),
  order: integer('order').notNull(),
  boardId: uuid('board_id').notNull().references(() => boards.id),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').default(''),
  dueDate: text('due_date'),
  labels: jsonb('labels').$type<string[]>().default([]),
  completed: boolean('completed').default(false),
  order: integer('order').notNull(),
  listId: uuid('list_id').notNull().references(() => lists.id),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parentId: uuid('parent_id').references((): any => tasks.id, { onDelete: 'cascade' }),
});

export const sessions = pgTable('sessions', {
id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
category: text('category').notNull(),
categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
userId: uuid('user_id').notNull().references(() => users.id),
startTime: timestamp('start_time', { withTimezone: true }).notNull(),
endTime: timestamp('end_time', { withTimezone: true }),
notes: text('notes'),
cardId: uuid('card_id').references(() => tasks.id, { onDelete: 'set null' }),
source: text('source').default('kanban').notNull(),
createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const categories = pgTable('categories', {
id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
name: text('name').notNull(),
// eslint-disable-next-line @typescript-eslint/no-explicit-any
parentId: integer('parent_id').references((): any => categories.id, { onDelete: 'cascade' }),
});

export const labelCategoryMappings = pgTable('label_category_mappings', {
id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
label: text('label').notNull(),
category: text('category').notNull(),
userId: uuid('user_id').notNull().references(() => users.id),
});

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const calendarHighlights = pgTable('calendar_highlights', {
  id: uuid('id').primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id),
  title: text('title').notNull(), // max 60 chars, plain text
  color: text('color').notNull(), // 'green' | 'yellow' | 'red' | 'blue' | 'purple'
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(workspaces),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  user: one(users, {
    fields: [workspaces.userId],
    references: [users.id],
  }),
  boards: many(boards),
  calendarHighlights: many(calendarHighlights),
  tags: many(tags),
}));

export const boardsRelations = relations(boards, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [boards.workspaceId],
    references: [workspaces.id],
  }),
  lists: many(lists),
}));

export const listsRelations = relations(lists, ({ one, many }) => ({
  board: one(boards, {
    fields: [lists.boardId],
    references: [boards.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  list: one(lists, {
    fields: [tasks.listId],
    references: [lists.id],
  }),
  parent: one(tasks, {
    fields: [tasks.parentId],
    references: [tasks.id],
    relationName: 'subtasks',
  }),
  children: many(tasks, {
    relationName: 'subtasks',
  }),
}));

export const calendarHighlightsRelations = relations(calendarHighlights, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [calendarHighlights.workspaceId],
    references: [workspaces.id],
  }),
}));

export const tagsRelations = relations(tags, ({ one }) => ({
workspace: one(workspaces, {
fields: [tags.workspaceId],
references: [workspaces.id],
}),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
parent: one(categories, {
fields: [categories.parentId],
references: [categories.id],
relationName: 'categoryTree',
}),
children: many(categories, {
relationName: 'categoryTree',
}),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
user: one(users, {
fields: [sessions.userId],
references: [users.id],
}),
category: one(categories, {
fields: [sessions.categoryId],
references: [categories.id],
}),
card: one(tasks, {
fields: [sessions.cardId],
references: [tasks.id],
}),
}));