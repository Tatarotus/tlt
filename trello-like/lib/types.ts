export type Task = { 
  id: string; 
  title: string; 
  description: string | null;
  dueDate: string | null;
  labels: string[] | null;
  completed?: boolean | null;
  order: number; 
  listId: string;
  parentId: string | null;
  children?: Task[];
};

export type List = { 
  id: string; 
  title: string; 
  order: number; 
  tasks: Task[] 
};